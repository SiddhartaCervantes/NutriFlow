import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface EditPatientData {
  nombre:    string;
  apellido:  string;
  email:     string | null;
  telefono:  string | null;
  edad:      number | null;
  genero:    string | null;
  peso:      number | null;
  altura:    number | null;
  objetivo:  string | null;
  actividad: string | null;
  estado:    'Activo' | 'Inactivo';
  notas:     string | null;
}

@Component({
  selector: 'app-edit-patient-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Editar paciente</h2>

    <mat-dialog-content class="ep-form">

      <div class="ep-row">
        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Nombre</mat-label>
          <input matInput [(ngModel)]="d.nombre" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Apellido</mat-label>
          <input matInput [(ngModel)]="d.apellido" required />
        </mat-form-field>
      </div>

      <div class="ep-row">
        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="d.email" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Teléfono</mat-label>
          <input matInput type="tel" [(ngModel)]="d.telefono" />
        </mat-form-field>
      </div>

      <div class="ep-row">
        <mat-form-field appearance="outline" class="ep-field ep-field--sm">
          <mat-label>Edad</mat-label>
          <input matInput type="number" [(ngModel)]="d.edad" min="1" max="120" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="ep-field ep-field--sm">
          <mat-label>Peso (kg)</mat-label>
          <input matInput type="number" [(ngModel)]="d.peso" min="1" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="ep-field ep-field--sm">
          <mat-label>Altura (cm)</mat-label>
          <input matInput type="number" [(ngModel)]="d.altura" min="1" />
        </mat-form-field>
      </div>

      <div class="ep-row">
        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Género</mat-label>
          <mat-select [(ngModel)]="d.genero">
            <mat-option value="Masculino">Masculino</mat-option>
            <mat-option value="Femenino">Femenino</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="d.estado">
            <mat-option value="Activo">Activo</mat-option>
            <mat-option value="Inactivo">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="ep-row">
        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Objetivo</mat-label>
          <mat-select [(ngModel)]="d.objetivo">
            <mat-option value="Pérdida de grasa">Pérdida de grasa</mat-option>
            <mat-option value="Ganancia muscular">Ganancia muscular</mat-option>
            <mat-option value="Mantenimiento">Mantenimiento</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="ep-field">
          <mat-label>Actividad</mat-label>
          <mat-select [(ngModel)]="d.actividad">
            <mat-option value="Sedentario">Sedentario</mat-option>
            <mat-option value="Ligero">Ligero</mat-option>
            <mat-option value="Moderado">Moderado</mat-option>
            <mat-option value="Activo">Activo</mat-option>
            <mat-option value="Muy activo">Muy activo</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="ep-field ep-field--full">
        <mat-label>Notas clínicas</mat-label>
        <textarea matInput [(ngModel)]="d.notas" rows="3"></textarea>
      </mat-form-field>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="!d.nombre || !d.apellido"
              (click)="confirm()">
        <mat-icon>save</mat-icon>
        Guardar cambios
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ep-form { display: flex; flex-direction: column; gap: 4px; min-width: 480px; padding-top: 8px; }
    .ep-row  { display: flex; gap: 12px; }
    .ep-field { flex: 1; }
    .ep-field--sm { flex: 0 0 calc(33% - 8px); }
    .ep-field--full { width: 100%; }
    @media (max-width: 540px) {
      .ep-form { min-width: unset; }
      .ep-row  { flex-direction: column; }
      .ep-field--sm { flex: 1; }
    }
  `],
})
export class EditPatientDialogComponent {
  d: EditPatientData;

  constructor(
    private ref: MatDialogRef<EditPatientDialogComponent, EditPatientData>,
    @Inject(MAT_DIALOG_DATA) data: EditPatientData,
  ) {
    this.d = { ...data };
  }

  confirm(): void {
    if (!this.d.nombre || !this.d.apellido) return;
    this.ref.close(this.d);
  }
}
