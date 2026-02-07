import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type PatientCard = {
  id: string;
  name: string;
  age: number;
  goal: string;
  status: 'Activo' | 'Inactivo';
};

@Component({
  selector: 'app-patient-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div
      class="patient-card"
      role="button"
      tabindex="0"
      (click)="select.emit(patient)"
    >
      <!-- Icono -->
      <div class="patient-card__icon" aria-hidden="true">
        <mat-icon>medical_services</mat-icon>
      </div>

      <!-- Contenido principal -->
      <div class="patient-card__content">
        <div class="patient-card__header">
          <div class="patient-card__name">
            {{ patient.name }}
          </div>

          
        </div>

        <div class="patient-card__meta">
          <span class="status">{{ patient.status }}</span>
          <span class="dot">•</span>
          <span>{{ patient.age }} años</span>
          <span class="dot">•</span>
          <span>{{ patient.goal }}</span>
        </div>

      </div>

      <!-- Botón de menú (⋮) -->
      <button
        type="button"
        class="patient-card__menu"
        aria-label="Opciones del paciente"
        (click)="onMenuClick($event)"
      >
        <mat-icon>more_vert</mat-icon>
      </button>

      <!-- Menú -->
      <div class="patient-card__dropdown" *ngIf="menuOpen">
        <button type="button" (click)="onEdit($event)">Editar</button>
        <button type="button" class="danger" (click)="onDelete($event)">
          Eliminar
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./patient-card.component.scss'],
})
export class PatientCardComponent {
  @Input({ required: true }) patient!: PatientCard;

  @Output() select = new EventEmitter<PatientCard>();
  @Output() edit = new EventEmitter<PatientCard>();
  @Output() delete = new EventEmitter<PatientCard>();

  menuOpen = false;

  onMenuClick(e: MouseEvent) {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  onEdit(e: MouseEvent) {
    e.stopPropagation();
    this.menuOpen = false;
    this.edit.emit(this.patient);
  }

  onDelete(e: MouseEvent) {
    e.stopPropagation();
    this.menuOpen = false;
    this.delete.emit(this.patient);
  }
}
