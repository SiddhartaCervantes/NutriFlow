import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NewMeasurement } from '../../data/measurement.service';

export interface AddMeasurementData {
  defaultHeightCm: number;
}

@Component({
  selector: 'app-add-measurement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva medición</h2>

    <mat-dialog-content style="min-width:400px; display:grid; gap:4px; padding-top:8px">

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <mat-form-field appearance="outline">
          <mat-label>Peso (kg)</mat-label>
          <input matInput type="number" min="1" max="300" step="0.1"
                 [(ngModel)]="weightKg" placeholder="75.5">
          <span matSuffix>kg</span>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Altura (cm)</mat-label>
          <input matInput type="number" min="50" max="250" step="0.1"
                 [(ngModel)]="heightCm" placeholder="170">
          <span matSuffix>cm</span>
        </mat-form-field>
      </div>

      <!-- IMC calculado -->
      @if (computedBmi !== null) {
        <div class="bmi-row">
          <span class="bmi-label">IMC calculado</span>
          <span class="bmi-value" [class]="bmiClass">{{ computedBmi }}</span>
          <span class="bmi-cat">{{ bmiCategory }}</span>
        </div>
      }

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px">
        <mat-form-field appearance="outline">
          <mat-label>% Grasa corporal</mat-label>
          <input matInput type="number" min="1" max="60" step="0.1"
                 [(ngModel)]="bodyFatPct" placeholder="Opcional">
          <span matSuffix>%</span>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha</mat-label>
          <input matInput type="date" [(ngModel)]="measuredAt">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Notas (opcional)</mat-label>
        <textarea matInput [(ngModel)]="notes" rows="2"
                  placeholder="Observaciones adicionales..."></textarea>
      </mat-form-field>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="!weightKg"
              (click)="confirm()">
        <mat-icon>save</mat-icon>
        Guardar medición
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .bmi-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(0,0,0,0.04);
      margin-bottom: 4px;
    }
    .bmi-label { font-size: 13px; opacity: .7; flex: 1; }
    .bmi-value { font-size: 20px; font-weight: 800; }
    .bmi-cat   { font-size: 12px; font-weight: 600; }

    .bmi-normal    { color: #2e7d32; }
    .bmi-low       { color: #0277bd; }
    .bmi-over      { color: #e65100; }
    .bmi-obese     { color: #c62828; }
  `],
})
export class AddMeasurementDialogComponent {
  weightKg:   number | null = null;
  heightCm:   number | null;
  bodyFatPct: number | null = null;
  measuredAt  = new Date().toISOString().split('T')[0];
  notes       = '';

  constructor(
    private dialogRef: MatDialogRef<AddMeasurementDialogComponent, NewMeasurement>,
    @Inject(MAT_DIALOG_DATA) public data: AddMeasurementData,
  ) {
    this.heightCm = data.defaultHeightCm || null;
  }

  get computedBmi(): number | null {
    if (!this.weightKg || !this.heightCm) return null;
    const h = this.heightCm / 100;
    return Math.round((this.weightKg / (h * h)) * 10) / 10;
  }

  get bmiCategory(): string {
    const b = this.computedBmi;
    if (b === null) return '';
    if (b < 18.5) return 'Bajo peso';
    if (b < 25)   return 'Normal';
    if (b < 30)   return 'Sobrepeso';
    return 'Obesidad';
  }

  get bmiClass(): string {
    const b = this.computedBmi;
    if (b === null) return '';
    if (b < 18.5) return 'bmi-low';
    if (b < 25)   return 'bmi-normal';
    if (b < 30)   return 'bmi-over';
    return 'bmi-obese';
  }

  confirm(): void {
    if (!this.weightKg) return;
    this.dialogRef.close({
      weight_kg:    this.weightKg,
      height_cm:    this.heightCm,
      bmi:          this.computedBmi,
      body_fat_pct: this.bodyFatPct || null,
      measured_at:  this.measuredAt,
      notes:        this.notes.trim() || null,
    });
  }
}
