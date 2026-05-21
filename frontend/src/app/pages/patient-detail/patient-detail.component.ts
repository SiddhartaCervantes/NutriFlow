import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { RecommendationService, RecommendationResponse } from '../../data/recommendation.service';
import { DietPlanService, DietDayRow } from '../../data/diet-plan.service';
import { PatientsSupabaseService, PatientRow } from '../../data/patients.supabase.service';
import { PatientNotesService, PatientNote } from '../../data/patient-notes.service';
import { MeasurementService, MeasurementRow, NewMeasurement } from '../../data/measurement.service';
import { AddToPlanDialogComponent, AddToPlanResult } from './add-to-plan-dialog.component';
import { EditPatientDialogComponent, EditPatientData } from './edit-patient-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { AddNoteDialogComponent } from './add-note-dialog.component';
import { AddMeasurementDialogComponent } from './add-measurement-dialog.component';
import { AssignMealDialogComponent } from './assign-meal-dialog.component';
import { ScheduleAppointmentDialogComponent, ScheduleAppointmentData } from './schedule-appointment-dialog.component';
import { AppointmentDialogComponent, AppointmentDialogResult } from '../../components/appointment-dialog/appointment-dialog.component';
import { RecipeRow } from '../../data/recipe.service';
import { AppointmentService, AppointmentRow, NewAppointment } from '../../data/appointment.service';
import { Router } from '@angular/router';
import { ExportService } from '../../services/export.service';
import { QrDialogComponent, QrDialogData } from './qr-dialog.component';
import { WeightChartComponent } from '../../shared/weight-chart/weight-chart.component';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

type MealSlot = {
  label: string;
  recipe?: string;
  notes?: string;
  kcal?: number;
  protein_g?: number;
};

type DayPlan = {
  day: DayKey;
  targetKcal?: number;
  targetProtein?: number;
  slots: MealSlot[];
  generalNotes?: string;
};

const EMPTY_DAY = (key: DayKey): DayPlan => ({
  day: key,
  slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }],
});

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDialogModule,
    WeightChartComponent,
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css',
})
export class PatientDetailComponent implements OnInit {
  private route                 = inject(ActivatedRoute);
  private router                = inject(Router);
  private recommendationService = inject(RecommendationService);
  private dietPlanService       = inject(DietPlanService);
  private patientsService       = inject(PatientsSupabaseService);
  private notesService          = inject(PatientNotesService);
  private measurementService    = inject(MeasurementService);
  private appointmentService    = inject(AppointmentService);
  private dialog                = inject(MatDialog);
  private exportService         = inject(ExportService);

  exporting = false;

  readonly Math = Math;

  patientId = '';
  loadingPatient = true;
  patientError = '';
  patientPhotoUrl = '';
  uploadingPhoto = false;
  photoUploadError = '';
  private rawPatient: PatientRow | null = null;

  patient = {
    name:          '',
    code:          '',
    age:           0,
    goal:          '',
    lastUpdate:    '',
    status:        'Activo' as 'Activo' | 'Inactivo',
    weightKg:      0,
    heightCm:      0,
    gender:        '',
    activityLevel: 'Ligero',
  };

  weekLabel = 'Semana actual';

  // ── Computed nutritional goals (Harris-Benedict) ───────────────────────────
  goals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  private computeGoals(): void {
    const { weightKg, heightCm, age, gender, goal, activityLevel } = this.patient;
    if (!weightKg || !heightCm || !age) return;

    const tmb = gender.toLowerCase() === 'masculino'
      ? 88.362  + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
      : 447.593 + (9.247  * weightKg) + (3.098 * heightCm) - (4.330 * age);

    const activityFactors: Record<string, number> = {
      'Ligero': 1.375, 'Moderado': 1.550, 'Activo': 1.725, 'Muy activo': 1.900,
    };
    const tdee = tmb * (activityFactors[activityLevel] ?? 1.200);

    const caloricTarget = goal === 'Pérdida de grasa'  ? tdee - 400
                        : goal === 'Ganancia muscular' ? tdee + 400
                        : tdee;

    const proteinG = goal === 'Pérdida de grasa'  ? weightKg * 2.0
                   : goal === 'Ganancia muscular' ? weightKg * 2.2
                   : weightKg * 1.6;

    const fatG   = (caloricTarget * 0.25) / 9;
    const carbsG = (caloricTarget - (proteinG * 4) - (fatG * 9)) / 4;

    this.goals = {
      calories: Math.round(caloricTarget),
      protein:  Math.round(proteinG),
      carbs:    Math.round(carbsG),
      fat:      Math.round(fatG),
    };
  }

  // ── IA state ───────────────────────────────────────────────────────────────
  isLoadingPlan = false;
  aiPlan: RecommendationResponse | null = null;
  aiError: string | null = null;
  isSavingPlan = false;
  saveSuccess  = false;
  saveError: string | null = null;

  // ── Measurements ───────────────────────────────────────────────────────────
  measurements: { label: string; value: string; meta: string }[] = [];
  lastMeasuredAt: string | null = null;
  private measurementsRaw: MeasurementRow[] = [];
  get measurementsForChart(): MeasurementRow[] { return this.measurementsRaw; }

  // ── Upcoming appointments ──────────────────────────────────────────────────
  upcomingAppointments: import('../../data/appointment.service').AppointmentRow[] = [];

  private loadMeasurementsDisplay(rows: MeasurementRow[]): void {
    this.measurementsRaw = rows;
    if (rows.length === 0) { this.measurements = []; return; }

    const latest = rows[0];
    const prev   = rows[1] ?? null;
    const items: typeof this.measurements = [];

    if (latest.weight_kg != null) {
      let meta = '';
      if (prev?.weight_kg != null) {
        const diff = +(latest.weight_kg - prev.weight_kg).toFixed(1);
        meta = diff === 0 ? 'Sin cambio'
             : diff > 0  ? `+${diff} kg vs anterior`
             : `${diff} kg vs anterior`;
      } else {
        meta = new Date(latest.measured_at + 'T00:00:00')
          .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      items.push({ label: 'Peso', value: `${latest.weight_kg} kg`, meta });
    }

    if (latest.bmi != null) {
      const cat = latest.bmi < 18.5 ? 'Bajo peso'
                : latest.bmi < 25   ? 'Normal'
                : latest.bmi < 30   ? 'Sobrepeso'
                : 'Obesidad';
      items.push({ label: 'IMC', value: `${latest.bmi}`, meta: cat });
    }

    if (latest.body_fat_pct != null) {
      items.push({ label: '% Grasa', value: `${latest.body_fat_pct}%`, meta: '' });
    }

    this.measurements    = items;
    this.lastMeasuredAt  = latest.measured_at;
  }

  async ngOnInit(): Promise<void> {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) { this.patientError = 'ID de paciente no encontrado.'; this.loadingPatient = false; return; }

    try {
      const p: PatientRow = await this.patientsService.getById(this.patientId);
      this.rawPatient = p;
      this.patientPhotoUrl = p.photo_url ?? '';
      this.patient = {
        name:          `${p.nombre} ${p.apellido}`,
        code:          `NF-${p.id.slice(0, 6).toUpperCase()}`,
        age:           p.edad ?? 0,
        goal:          p.objetivo ?? 'Mantenimiento',
        lastUpdate:    new Date(p.created_at).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
        status:        p.estado,
        weightKg:      Number(p.peso ?? 0),
        heightCm:      Number(p.altura ?? 0),
        gender:        p.genero ?? 'Femenino',
        activityLevel: p.actividad ?? 'Ligero',
      };

      this.computeGoals();

      const [, measurementsRows, notesRows, appointments] = await Promise.all([
        this.loadExistingPlan(),
        this.measurementService.getByPatient(this.patientId),
        this.notesService.getByPatient(this.patientId),
        this.appointmentService.getUpcoming(this.patientId),
      ]);

      this.loadMeasurementsDisplay(measurementsRows);
      this.notes = notesRows;
      this.upcomingAppointments = appointments;
    } catch (e: any) {
      this.patientError = e?.message ?? 'Error al cargar el paciente.';
    } finally {
      this.loadingPatient = false;
    }
  }

  async generateAIPlan(): Promise<void> {
    this.isLoadingPlan = true;
    this.aiError       = null;
    this.saveSuccess   = false;
    this.saveError     = null;
    try {
      this.aiPlan = await this.recommendationService.generatePlan({
        weightKg:      this.patient.weightKg,
        heightCm:      this.patient.heightCm,
        age:           this.patient.age,
        gender:        this.patient.gender,
        goal:          this.patient.goal,
        activityLevel: this.patient.activityLevel,
      });
    } catch (err: any) {
      if (err?.status === 400) {
        this.aiError = 'Datos del paciente incompletos. Verifica que tenga peso, altura y edad registrados.';
      } else if (err?.status > 0) {
        this.aiError = `Error del servidor (${err.status}). Intenta de nuevo.`;
      } else {
        this.aiError = 'No se pudo conectar con el sistema de recomendación. Verifica que el backend esté activo.';
      }
    } finally {
      this.isLoadingPlan = false;
    }
  }

  private async loadExistingPlan(): Promise<void> {
    const loaded = await this.dietPlanService.loadPlan(this.patientId);
    if (!loaded) return;

    for (const day of loaded.days as DietDayRow[]) {
      const key = this.dayNameToKey[day.day_of_week];
      if (!key) continue;

      const plan = this.dayPlans[key];
      for (const meal of day.meals) {
        const slot = plan.slots.find(s => s.label.toLowerCase() === meal.meal_type);
        if (slot) {
          slot.recipe    = meal.meal_name;
          slot.kcal      = meal.calories;
          slot.protein_g = meal.protein;
        }
      }
    }
  }

  private readonly dayNameToKey: Record<string, DayKey> = {
    'Lunes':     'Mon',
    'Martes':    'Tue',
    'Miércoles': 'Wed',
    'Jueves':    'Thu',
    'Viernes':   'Fri',
    'Sábado':    'Sat',
    'Domingo':   'Sun',
  };

  private readonly dayKeyToName: Record<DayKey, string> = {
    Mon: 'Lunes',   Tue: 'Martes', Wed: 'Miércoles', Thu: 'Jueves',
    Fri: 'Viernes', Sat: 'Sábado', Sun: 'Domingo',
  };

  private readonly dayKeyToOrder: Record<DayKey, string> = {
    Mon: '1', Tue: '2', Wed: '3', Thu: '4',
    Fri: '5', Sat: '6', Sun: '7',
  };

  openAddToPlan(): void {
    if (!this.aiPlan) return;

    const occupiedDays = Object.entries(this.dayPlans)
      .filter(([, plan]) => plan.slots.some(s => s.recipe))
      .map(([, plan]) => {
        const entry = Object.entries(this.dayNameToKey).find(([, k]) => k === plan.day);
        return entry ? entry[0] : '';
      })
      .filter(Boolean);

    const ref = this.dialog.open(AddToPlanDialogComponent, {
      width: '420px',
      data: {
        meals:         this.aiPlan.meals,
        goal:          this.patient.goal,
        dailyCalories: this.aiPlan.targets.dailyCalorieTarget,
        occupiedDays,
      },
    });

    ref.afterClosed().subscribe(async (result: AddToPlanResult | undefined) => {
      if (!result?.day || !this.aiPlan) return;

      this.isSavingPlan = true;
      this.saveSuccess  = false;
      this.saveError    = null;

      try {
        await this.dietPlanService.savePlan({
          patientId:    this.patientId,
          title:        result.title,
          dayOfWeek:    result.day,
          displayOrder: result.displayOrder,
          goal:         this.patient.goal,
          targets:      this.aiPlan!.targets,
          meals:        this.aiPlan!.meals,
        });

        const dayKey = this.dayNameToKey[result.day];
        if (dayKey) {
          const plan = this.dayPlans[dayKey];
          plan.targetKcal    = Math.round(this.aiPlan!.targets.dailyCalorieTarget);
          plan.targetProtein = Math.round(this.aiPlan!.targets.proteinTargetG);

          for (const meal of this.aiPlan!.meals) {
            if (!meal.recipe) continue;
            const slot = plan.slots.find(s => s.label === meal.slot);
            if (slot) {
              slot.recipe    = meal.recipe.name;
              slot.kcal      = meal.recipe.calories;
              slot.protein_g = Math.round(Number(meal.recipe.proteinG));
            }
          }
        }

        this.saveSuccess = true;
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al guardar el plan.';
      } finally {
        this.isSavingPlan = false;
      }
    });
  }

  openScheduleAppointment(): void {
    const ref = this.dialog.open(ScheduleAppointmentDialogComponent, {
      width: '860px',
      maxWidth: '96vw',
      data: {
        patientId:   this.patientId,
        patientName: this.patient.name,
      } as ScheduleAppointmentData,
    });

    ref.afterClosed().subscribe(async (result: NewAppointment | undefined) => {
      if (!result) return;
      try {
        await this.appointmentService.add(result);
        const iso = result.date_time.split('T')[0];
        this.router.navigate(['/calendar'], { queryParams: { date: iso } });
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al agendar la cita.';
      }
    });
  }

  openEditAppointment(appt: AppointmentRow): void {
    this.dialog
      .open(AppointmentDialogComponent, { data: appt, width: '420px' })
      .afterClosed()
      .subscribe(async (result: AppointmentDialogResult) => {
        if (!result) return;
        if (result.action === 'save') {
          try {
            const updated = await this.appointmentService.update(appt.id, result.changes);
            this.upcomingAppointments = this.upcomingAppointments.map(a =>
              a.id === appt.id ? updated : a
            );
          } catch { this.saveError = 'No se pudo actualizar la cita.'; }
        }
        if (result.action === 'cancel') {
          try {
            await this.appointmentService.delete(appt.id);
            this.upcomingAppointments = this.upcomingAppointments.filter(a => a.id !== appt.id);
          } catch { this.saveError = 'No se pudo cancelar la cita.'; }
        }
      });
  }

  openAddMeasurement(): void {
    const ref = this.dialog.open(AddMeasurementDialogComponent, {
      width: '480px',
      data: { defaultHeightCm: this.patient.heightCm },
    });

    ref.afterClosed().subscribe(async (result: NewMeasurement | undefined) => {
      if (!result) return;
      try {
        const row = await this.measurementService.add(this.patientId, result);
        this.loadMeasurementsDisplay([row, ...this.measurementsRaw]);
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al guardar la medición.';
      }
    });
  }

  // ── Week grid ──────────────────────────────────────────────────────────────
  days: { key: DayKey; label: string }[] = [
    { key: 'Mon', label: 'Lun' },
    { key: 'Tue', label: 'Mar' },
    { key: 'Wed', label: 'Mié' },
    { key: 'Thu', label: 'Jue' },
    { key: 'Fri', label: 'Vie' },
    { key: 'Sat', label: 'Sáb' },
    { key: 'Sun', label: 'Dom' },
  ];

  dayPlans: Record<DayKey, DayPlan> = {
    Mon: EMPTY_DAY('Mon'),
    Tue: EMPTY_DAY('Tue'),
    Wed: EMPTY_DAY('Wed'),
    Thu: EMPTY_DAY('Thu'),
    Fri: EMPTY_DAY('Fri'),
    Sat: EMPTY_DAY('Sat'),
    Sun: EMPTY_DAY('Sun'),
  };

  adherence = { week: 0, mealsLogged: 0, mealsPlanned: 21 };
  notes: PatientNote[] = [];
  deletingNoteId: string | null = null;

  getSlot(day: DayKey, label: string): MealSlot | undefined {
    return this.dayPlans[day].slots.find(s => s.label === label);
  }

  calorieAccuracy(recommended: number, target: number): number {
    return Math.round(Math.abs(recommended - target));
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingPhoto = true;
    this.photoUploadError = '';
    try {
      this.patientPhotoUrl = await this.patientsService.uploadPhoto(this.patientId, file);
    } catch (e: any) {
      this.photoUploadError = e?.message ?? 'Error al subir la foto.';
    } finally {
      this.uploadingPhoto = false;
    }
  }

  onEditPatient(): void {
    const ref = this.dialog.open(EditPatientDialogComponent, {
      width: '560px',
      data: {
        nombre:    this.rawPatient?.nombre    ?? this.patient.name.split(' ')[0],
        apellido:  this.rawPatient?.apellido  ?? this.patient.name.split(' ').slice(1).join(' '),
        email:     this.rawPatient?.email     ?? null,
        telefono:  this.rawPatient?.telefono  ?? null,
        edad:      this.patient.age,
        genero:    this.patient.gender,
        peso:      this.patient.weightKg,
        altura:    this.patient.heightCm,
        objetivo:  this.patient.goal,
        actividad: this.patient.activityLevel,
        estado:    this.patient.status,
        notas:     this.rawPatient?.notas     ?? null,
      } as EditPatientData,
    });

    ref.afterClosed().subscribe(async (result: EditPatientData | undefined) => {
      if (!result) return;
      try {
        const updated = await this.patientsService.update(this.patientId, {
          nombre:    result.nombre.trim(),
          apellido:  result.apellido.trim(),
          email:     result.email     || null,
          telefono:  result.telefono  || null,
          edad:      result.edad,
          genero:    result.genero,
          peso:      result.peso,
          altura:    result.altura,
          objetivo:  result.objetivo,
          actividad: result.actividad,
          estado:    result.estado,
          notas:     result.notas     || null,
        });
        this.patient = {
          ...this.patient,
          name:          `${updated.nombre} ${updated.apellido}`,
          age:           updated.edad ?? this.patient.age,
          goal:          updated.objetivo ?? this.patient.goal,
          status:        updated.estado,
          weightKg:      Number(updated.peso ?? this.patient.weightKg),
          heightCm:      Number(updated.altura ?? this.patient.heightCm),
          gender:        updated.genero ?? this.patient.gender,
          activityLevel: updated.actividad ?? this.patient.activityLevel,
        };
        this.rawPatient = updated;
        this.computeGoals();
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al actualizar el paciente.';
      }
    });
  }

  onDeletePatient(): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { name: this.patient.name },
    });

    ref.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (!confirmed) return;
      try {
        await this.patientsService.delete(this.patientId);
        this.router.navigate(['/patients']);
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al eliminar el paciente.';
      }
    });
  }

  openAddNote(): void {
    const ref = this.dialog.open(AddNoteDialogComponent, { width: '500px' });

    ref.afterClosed().subscribe(async (text: string | undefined) => {
      if (!text) return;
      try {
        const note = await this.notesService.add(this.patientId, text);
        this.notes = [note, ...this.notes];
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al guardar la nota.';
      }
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    this.deletingNoteId = noteId;
    try {
      await this.notesService.delete(noteId);
      this.notes = this.notes.filter(n => n.id !== noteId);
    } catch (e: any) {
      this.saveError = e?.message ?? 'Error al eliminar la nota.';
    } finally {
      this.deletingNoteId = null;
    }
  }

  onNewWeek() {}
  onPrevWeek() {}
  onNextWeek() {}
  exportPlan(): void {
    this.exporting = true;
    try {
      this.exportService.exportPlanPdf({
        patientName: this.patient.name,
        goal:        this.patient.goal,
        age:         this.patient.age,
        ...this.goals,
        days: this.days.map(d => ({
          name: this.dayKeyToName[d.key],
          meals: this.dayPlans[d.key].slots
            .filter(s => s.recipe)
            .map(s => ({ slot: s.label, recipe: s.recipe!, kcal: s.kcal ?? 0, protein: s.protein_g ?? 0 })),
        })),
      });
    } finally {
      this.exporting = false;
    }
  }

  openQrDialog(): void {
    const email = this.rawPatient?.email ?? '';
    const base  = window.location.origin;
    const url   = email
      ? `${base}/patient-portal?e=${btoa(email)}`
      : `${base}/patient-portal`;

    this.dialog.open<QrDialogComponent, QrDialogData>(QrDialogComponent, {
      width: '360px',
      data: { patientName: this.patient.name, url },
    });
  }

  onAddMeal(day: DayKey, slot: string): void {
    const ref = this.dialog.open(AssignMealDialogComponent, {
      width: '500px',
      data: { day, dayLabel: this.dayKeyToName[day], slot },
    });

    ref.afterClosed().subscribe(async (recipe: RecipeRow | undefined) => {
      if (!recipe) return;
      try {
        await this.dietPlanService.saveSingleMeal({
          patientId:    this.patientId,
          dayOfWeek:    this.dayKeyToName[day],
          displayOrder: this.dayKeyToOrder[day],
          slot,
          recipe,
        });

        const plan = this.dayPlans[day];
        const mealSlot = plan.slots.find(s => s.label === slot);
        if (mealSlot) {
          mealSlot.recipe    = recipe.name;
          mealSlot.kcal      = recipe.calories;
          mealSlot.protein_g = Math.round(Number(recipe.protein_g));
        }
      } catch (e: any) {
        this.saveError = e?.message ?? 'Error al asignar la receta.';
      }
    });
  }
}
