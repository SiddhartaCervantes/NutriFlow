import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { PatientsSupabaseService, PatientRow } from '../../data/patients.supabase.service';
import { NewAppointment, AppointmentRow } from '../../data/appointment.service';

export interface NewAppointmentDialogData {
  isoDate:      string;           // YYYY-MM-DD
  existing:     AppointmentRow[]; // para bloquear slots ocupados
}

@Component({
  selector: 'app-new-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva cita</h2>

    <mat-dialog-content>
      @if (loadingPatients) {
        <div class="center"><mat-spinner diameter="32"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Paciente</mat-label>
            <mat-select formControlName="patient_id">
              @for (p of patients; track p.id) {
                <mat-option [value]="p.id">
                  <div class="patient-opt">
                    <img class="patient-opt__avatar"
                      [src]="p.photo_url || 'assets/privado.png'"
                      [alt]="p.nombre" />
                    <span>{{ p.nombre }} {{ p.apellido }}</span>
                  </div>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" readonly />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hora</mat-label>
              <mat-select formControlName="time">
                @for (slot of timeSlots; track slot) {
                  <mat-option [value]="slot" [disabled]="isTaken(slot)">
                    {{ slot }}{{ isTaken(slot) ? ' — ocupado' : '' }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Modalidad</mat-label>
            <mat-select formControlName="mode">
              <mat-option value="Online">Online</mat-option>
              <mat-option value="Presencial">Presencial</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nota (opcional)</mat-label>
            <textarea matInput formControlName="note" rows="3"></textarea>
          </mat-form-field>

          @if (error) {
            <p class="error">{{ error }}</p>
          }
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="submit()"
        [disabled]="form.invalid || saving">
        @if (saving) {
          <mat-spinner diameter="18"></mat-spinner>
        } @else {
          Agendar cita
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 4px; min-width: 380px; padding-top: 8px; }
    mat-form-field { width: 100%; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .center { display: flex; justify-content: center; padding: 24px; }
    .error { color: #c62828; font-size: 13px; margin: 4px 0 0; }
    mat-spinner { display: inline-block; }
    .patient-opt { display: flex; align-items: center; gap: 10px; }
    .patient-opt__avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    @media (max-width: 480px) { .form { min-width: unset; } .row { grid-template-columns: 1fr; } }
  `],
})
export class NewAppointmentDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  patients: PatientRow[] = [];
  loadingPatients = true;
  saving = false;
  error = '';

  readonly timeSlots = this.buildTimeSlots();
  private takenSlots = new Set<string>();
  private sub = new Subscription();

  constructor(
    private fb: FormBuilder,
    private patientsService: PatientsSupabaseService,
    public dialogRef: MatDialogRef<NewAppointmentDialogComponent, NewAppointment | null>,
    @Inject(MAT_DIALOG_DATA) public data: NewAppointmentDialogData,
  ) {
    this.form = this.fb.group({
      patient_id: ['',                                Validators.required],
      date:       [new Date(data.isoDate + 'T12:00'), Validators.required],
      time:       ['09:00',                           Validators.required],
      mode:       ['Presencial',                      Validators.required],
      note:       [''],
    });
  }

  async ngOnInit(): Promise<void> {
    this.updateTakenSlots(this.form.value.date);
    this.sub.add(
      this.form.get('date')!.valueChanges.subscribe(d => this.updateTakenSlots(d))
    );
    try {
      this.patients = await this.patientsService.getAll();
    } catch {
      this.error = 'No se pudo cargar la lista de pacientes.';
    } finally {
      this.loadingPatients = false;
    }
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  isTaken(slot: string): boolean { return this.takenSlots.has(slot); }

  private updateTakenSlots(date: Date | null): void {
    this.takenSlots.clear();
    if (!date) return;
    const isoDate = this.toIsoDate(date);
    for (const appt of this.data.existing) {
      if (appt.date_time.slice(0, 10) === isoDate) {
        const d = new Date(appt.date_time);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        // round minutes to nearest :00 or :30
        const roundedMm = d.getMinutes() < 15 ? '00' : d.getMinutes() < 45 ? '30' : '00';
        const roundedHh = d.getMinutes() >= 45
          ? String(d.getHours() + 1).padStart(2, '0')
          : hh;
        this.takenSlots.add(`${roundedHh}:${roundedMm}`);
      }
    }
    // if current selected time is now taken, reset it
    const currentTime = this.form?.get('time')?.value;
    if (currentTime && this.takenSlots.has(currentTime)) {
      this.form.get('time')!.setValue('');
    }
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.getRawValue();
    const patient = this.patients.find(p => p.id === val.patient_id)!;

    const [hours, minutes] = (val.time as string).split(':').map(Number);
    const dt = new Date(val.date as Date);
    dt.setHours(hours, minutes, 0, 0);

    const result: NewAppointment = {
      patient_id:   patient.id,
      patient_name: `${patient.nombre} ${patient.apellido}`,
      date_time:    dt.toISOString(),
      mode:         val.mode,
      note:         val.note?.trim() || null,
    };
    this.dialogRef.close(result);
  }

  private buildTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 7; h <= 21; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      if (h < 21) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  }
}
