import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExportService } from '../../services/export.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { supabase } from '../../data/supabase.client';
import { DietPlanService, LoadedPlan } from '../../data/diet-plan.service';
import { MeasurementService, MeasurementRow } from '../../data/measurement.service';
import { AppointmentService, AppointmentRow } from '../../data/appointment.service';
import { PatientRow } from '../../data/patients.supabase.service';
import { WeightChartComponent } from '../../shared/weight-chart/weight-chart.component';

type MealSlot = { label: string; recipe?: string; kcal?: number; protein_g?: number };
type DayGrid  = { label: string; slots: MealSlot[] };

@Component({
  selector: 'app-mi-plan',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, WeightChartComponent],
  templateUrl: './mi-plan.component.html',
  styleUrl: './mi-plan.component.css',
})
export class MiPlanComponent implements OnInit {
  loading = true;
  error   = '';

  patient: PatientRow | null = null;
  measurements: MeasurementRow[] = [];

  goals = { tmb: 0, tdee: 0, calories: 0, protein: 0, carbs: 0, fat: 0 };
  upcomingAppointments: AppointmentRow[] = [];

  readonly slotLabels = ['Desayuno', 'Comida', 'Cena'];
  days: DayGrid[] = [];

  readonly dayOrder = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  get weekLabel(): string {
    const now   = new Date();
    const day   = now.getDay();
    const diff  = (day === 0 ? -6 : 1 - day);
    const mon   = new Date(now); mon.setDate(now.getDate() + diff);
    const sun   = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt   = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    return `Semana del ${fmt(mon)} al ${fmt(sun)} de ${sun.getFullYear()}`;
  }

  exportPlan(): void {
    if (!this.patient) return;
    this.exporting = true;
    try {
      this.exportService.exportPlanPdf({
        patientName: `${this.patient.nombre} ${this.patient.apellido}`,
        goal:        this.patient.objetivo ?? 'Mantenimiento',
        age:         this.patient.edad ?? 0,
        ...this.goals,
        days: this.days.map(d => ({
          name:  d.label,
          meals: d.slots
            .filter(s => s.recipe)
            .map(s => ({ slot: s.label, recipe: s.recipe!, kcal: s.kcal ?? 0, protein: s.protein_g ?? 0 })),
        })),
      });
    } finally {
      this.exporting = false;
    }
  }

  exporting = false;

  constructor(
    private dietPlanService:    DietPlanService,
    private measurementService: MeasurementService,
    private appointmentService: AppointmentService,
    private router:             Router,
    private exportService:      ExportService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { this.router.navigate(['/patient-portal']); return; }

      const { data: p, error: pErr } = await supabase
        .from('patients')
        .select('*')
        .eq('email', user.email)
        .single();

      if (pErr || !p) {
        this.error = 'No se encontró tu perfil de paciente. Contacta a tu nutricionista.';
        return;
      }

      this.patient = p;
      this.computeGoals(p);

      const [plan, measures, appointments] = await Promise.all([
        this.dietPlanService.loadPlan(p.id),
        this.measurementService.getByPatient(p.id),
        this.appointmentService.getUpcoming(p.id),
      ]);

      this.buildGrid(plan);
      this.measurements = measures;
      this.upcomingAppointments = appointments;
    } catch (e: any) {
      this.error = e?.message ?? 'Error al cargar tu plan.';
    } finally {
      this.loading = false;
    }
  }

  private buildGrid(plan: LoadedPlan | null): void {
    const planDays = plan?.days ?? [];

    this.days = this.dayOrder.map(dayName => {
      const dayData = planDays.find(d => d.day_of_week === dayName);
      return {
        label: dayName,
        slots: this.slotLabels.map(lbl => {
          const meal = dayData?.meals.find(m => m.meal_type.toLowerCase() === lbl.toLowerCase());
          return meal
            ? { label: lbl, recipe: meal.meal_name, kcal: meal.calories, protein_g: meal.protein }
            : { label: lbl };
        }),
      };
    });
  }

  private computeGoals(p: PatientRow): void {
    const w = Number(p.peso ?? 0);
    const h = Number(p.altura ?? 0);
    const a = p.edad ?? 0;
    if (!w || !h || !a) return;

    const tmb = (p.genero ?? '').toLowerCase() === 'masculino'
      ? 88.362  + (13.397 * w) + (4.799 * h) - (5.677 * a)
      : 447.593 + (9.247  * w) + (3.098 * h) - (4.330 * a);

    const factors: Record<string, number> = {
      'Sedentario': 1.200, 'Ligero': 1.375, 'Moderado': 1.550,
      'Activo': 1.725, 'Muy activo': 1.900,
    };
    const tdee   = tmb * (factors[p.actividad ?? 'Ligero'] ?? 1.375);
    const target = p.objetivo === 'Pérdida de grasa'  ? tdee - 400
                 : p.objetivo === 'Ganancia muscular' ? tdee + 400
                 : tdee;

    const protein = p.objetivo === 'Pérdida de grasa'  ? w * 2.0
                  : p.objetivo === 'Ganancia muscular' ? w * 2.2
                  : w * 1.6;
    const fat   = (target * 0.25) / 9;
    const carbs = (target - (protein * 4) - (fat * 9)) / 4;

    this.goals = {
      tmb:      Math.round(tmb),
      tdee:     Math.round(tdee),
      calories: Math.round(target),
      protein:  Math.round(protein),
      carbs:    Math.round(carbs),
      fat:      Math.round(fat),
    };
  }

  get latestMeasurement(): MeasurementRow | null { return this.measurements[0] ?? null; }

  getSlot(day: DayGrid, label: string): MealSlot | undefined {
    return day.slots.find(s => s.label === label);
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this.router.navigate(['/patient-portal']);
  }
}
