import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { AppointmentRow } from '../../data/appointment.service';

export type AppointmentDialogResult =
  | { action: 'save';   changes: { date_time: string; mode: 'Online' | 'Presencial'; note: string | null } }
  | { action: 'cancel' }
  | null;

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <h2 mat-dialog-title>Cita con {{ data.patient_name }}</h2>

    <mat-dialog-content>
      @if (!editing) {
        <!-- Vista detalle -->
        <div class="detail">
          <div class="detail__row">
            <mat-icon>event</mat-icon>
            <span>{{ formatDateTime(data.date_time) }}</span>
          </div>
          <div class="detail__row">
            <mat-icon>{{ data.mode === 'Online' ? 'videocam' : 'place' }}</mat-icon>
            <span>{{ data.mode }}</span>
          </div>
          @if (data.note) {
            <div class="detail__row">
              <mat-icon>notes</mat-icon>
              <span>{{ data.note }}</span>
            </div>
          }
        </div>
      } @else {
        <!-- Formulario edición -->
        <form [formGroup]="form" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Fecha y hora</mat-label>
            <input matInput type="datetime-local" formControlName="date_time" />
          </mat-form-field>

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
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button color="warn" class="cancel-btn"
        (click)="confirmCancel()">
        <mat-icon>event_busy</mat-icon>
        Cancelar cita
      </button>

      <span class="spacer"></span>

      @if (!editing) {
        <button mat-button [mat-dialog-close]="null">Cerrar</button>
        <button mat-flat-button color="primary" (click)="editing = true">
          <mat-icon>edit</mat-icon>
          Editar
        </button>
      } @else {
        <button mat-button (click)="editing = false">Atrás</button>
        <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
          Guardar
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .detail { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; min-width: 340px; }
    .detail__row { display: flex; align-items: center; gap: 10px; font-size: 15px; }
    .detail__row mat-icon { color: rgba(0,0,0,0.45); flex-shrink: 0; }

    .form { display: flex; flex-direction: column; gap: 4px; min-width: 360px; padding-top: 8px; }
    mat-form-field { width: 100%; }

    mat-dialog-actions { display: flex; align-items: center; gap: 8px; }
    .spacer { flex: 1; }
    .cancel-btn { font-size: 13px; }

    @media (max-width: 480px) {
      .detail, .form { min-width: unset; }
    }
  `],
})
export class AppointmentDialogComponent {
  editing = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentDialogComponent, AppointmentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentRow,
  ) {
    this.form = this.fb.group({
      date_time: [this.toLocalInput(data.date_time), Validators.required],
      mode:      [data.mode,                         Validators.required],
      note:      [data.note ?? ''],
    });
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  private toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  save(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.dialogRef.close({
      action: 'save',
      changes: {
        date_time: new Date(val.date_time).toISOString(),
        mode:      val.mode,
        note:      val.note?.trim() || null,
      },
    });
  }

  confirmCancel(): void {
    if (!confirm('¿Cancelar esta cita? Esta acción no se puede deshacer.')) return;
    this.dialogRef.close({ action: 'cancel' });
  }
}
