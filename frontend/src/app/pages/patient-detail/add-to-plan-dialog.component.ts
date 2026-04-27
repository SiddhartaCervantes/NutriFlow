import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MealRecommendation } from '../../data/recommendation.service';

export interface AddToPlanData {
  meals: MealRecommendation[];
  goal: string;
  dailyCalories: number;
  occupiedDays: string[];   // días que ya tienen comidas asignadas
}

export interface AddToPlanResult {
  day: string;
  displayOrder: string;
  title: string;
}

@Component({
  selector: 'app-add-to-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Agregar plan al día</h2>

    <mat-dialog-content style="min-width:360px">

      <!-- Resumen de comidas -->
      <div style="display:grid; gap:8px; margin-bottom:20px">
        @for (m of data.meals; track m.slot) {
          <div style="display:flex; justify-content:space-between; align-items:center;
                      padding:8px 12px; border-radius:10px; background:rgba(0,0,0,0.04)">
            <span style="font-weight:700; font-size:13px">{{ m.slot }}</span>
            @if (m.recipe) {
              <span style="font-size:13px">
                {{ m.recipe.name }}
                <span style="opacity:.6"> · {{ m.recipe.calories }} kcal</span>
              </span>
            } @else {
              <span style="font-size:13px; opacity:.5">Sin receta</span>
            }
          </div>
        }
      </div>

      <!-- Título del plan -->
      <mat-form-field appearance="outline" style="width:100%; margin-bottom:4px">
        <mat-label>Título del plan</mat-label>
        <input matInput [(ngModel)]="title" placeholder="Plan semana 1, Plan mayo...">
      </mat-form-field>

      <!-- Día de la semana -->
      <p style="font-weight:700; margin:12px 0 8px">¿A qué día lo asignas?</p>
      <mat-radio-group [(ngModel)]="selectedDay"
                       style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
        @for (d of days; track d.key) {
          <mat-radio-button [value]="d.key">
            <div style="display:flex; flex-direction:column; line-height:1.3">
              <span>{{ d.label }}</span>
              @if (isOccupied(d.key)) {
                <span style="font-size:11px; color:#e65100; font-weight:600">
                  ⚠ Ya tiene plan — se sobreescribirá
                </span>
              } @else {
                <span style="font-size:11px; opacity:.5">Disponible</span>
              }
            </div>
          </mat-radio-button>
        }
      </mat-radio-group>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button
              [color]="isOccupied(selectedDay) ? 'warn' : 'primary'"
              [disabled]="!selectedDay"
              (click)="confirm()">
        {{ isOccupied(selectedDay) ? 'Sobreescribir plan' : 'Guardar en plan' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AddToPlanDialogComponent {
  selectedDay = '';
  title = '';

  days = [
    { key: 'Lunes',     label: 'Lunes',     order: '1' },
    { key: 'Martes',    label: 'Martes',    order: '2' },
    { key: 'Miércoles', label: 'Miércoles', order: '3' },
    { key: 'Jueves',    label: 'Jueves',    order: '4' },
    { key: 'Viernes',   label: 'Viernes',   order: '5' },
    { key: 'Sábado',    label: 'Sábado',    order: '6' },
    { key: 'Domingo',   label: 'Domingo',   order: '7' },
  ];

  constructor(
    private dialogRef: MatDialogRef<AddToPlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddToPlanData,
  ) {
    this.title = `Plan IA — ${data.goal}`;
  }

  isOccupied(dayKey: string): boolean {
    return this.data.occupiedDays.includes(dayKey);
  }

  confirm(): void {
    const selected = this.days.find(d => d.key === this.selectedDay)!;
    this.dialogRef.close({
      day:          this.selectedDay,
      displayOrder: selected.order,
      title:        this.title || `Plan IA — ${this.data.goal}`,
    } as AddToPlanResult);
  }
}
