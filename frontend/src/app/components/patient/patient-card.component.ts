import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

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
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="patient-card" role="button" tabindex="0" (click)="goToDetail()">
      <div class="patient-card__icon" aria-hidden="true">
        <mat-icon>medical_services</mat-icon>
      </div>

      <div class="patient-card__content">
        <div class="patient-card__name">{{ patient.name }}</div>

        <div class="patient-card__meta">
          <span class="status-badge"
                [class.status-badge--active]="patient.status === 'Activo'"
                [class.status-badge--inactive]="patient.status === 'Inactivo'">
            <span class="status-badge__dot"></span>
            {{ patient.status }}
          </span>
          <span class="dot">•</span>
          <span>{{ patient.age }} años</span>
          <span class="dot">•</span>
          <span>{{ patient.goal }}</span>
        </div>
      </div>

      <!-- botón ⋮ -->
      <button
        type="button"
        class="patient-card__menu"
        aria-label="Opciones del paciente"
        (click)="toggleMenu($event)"
      >
        <mat-icon>more_vert</mat-icon>
      </button>

      <!-- dropdown -->
      <div
        class="patient-card__dropdown"
        *ngIf="menuOpen"
        (click)="$event.stopPropagation()"
      >
        <button type="button" (click)="onEdit($event)">Editar</button>
        <button type="button" class="danger" (click)="onDelete($event)">Eliminar</button>
      </div>
    </div>
  `,
  styleUrls: ['./patient-card.component.scss'],
})
export class PatientCardComponent {
  @Input({ required: true }) patient!: PatientCard;

  @Output() edit = new EventEmitter<PatientCard>();
  @Output() delete = new EventEmitter<PatientCard>();

  menuOpen = false;

  constructor(
    private router: Router,
    private elRef: ElementRef<HTMLElement>
  ) {}

  goToDetail() {
    if (this.menuOpen) return;
    this.router.navigate(['/patients', this.patient.id]);
  }

  toggleMenu(e: MouseEvent) {
    e.stopPropagation(); // ✅ clave
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

  // ✅ click afuera lo cierra, click adentro NO
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target as Node);
    if (!clickedInside) this.menuOpen = false;
  }
}
