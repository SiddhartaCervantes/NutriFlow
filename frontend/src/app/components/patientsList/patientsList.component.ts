import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PatientCardComponent, PatientCard } from '../patient/patient-card.component';
import { PatientsSupabaseService } from '../../data/patients.supabase.service';
import { ConfirmDeleteDialogComponent } from '../../pages/patient-detail/confirm-delete-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, PatientCardComponent],
  templateUrl: './patientsList.component.html',
  styleUrls: ['./patientsList.component.scss'],
})
export class PatientListComponent {
  @Input() title = 'LISTA DE PACIENTES';
  @Input() patients: PatientCard[] = [];

  query        = '';
  statusFilter = '';
  goalFilter   = '';

  readonly statusOptions = [
    { label: 'Todos',    value: '' },
    { label: 'Activo',   value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' },
  ];

  readonly goalOptions = [
    { label: 'Todos',              value: '' },
    { label: 'Pérdida de grasa',   value: 'Pérdida de grasa' },
    { label: 'Ganancia muscular',  value: 'Ganancia muscular' },
    { label: 'Mantenimiento',      value: 'Mantenimiento' },
  ];

  get hasActiveFilters(): boolean {
    return !!this.query || !!this.statusFilter || !!this.goalFilter;
  }

  get filtered(): PatientCard[] {
    const q = this.query.trim().toLowerCase();
    return this.patients.filter(p => {
      const matchesQuery  = !q || p.name.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q);
      const matchesStatus = !this.statusFilter || p.status === this.statusFilter;
      const matchesGoal   = !this.goalFilter   || p.goal   === this.goalFilter;
      return matchesQuery && matchesStatus && matchesGoal;
    });
  }

  resetFilters(): void {
    this.query        = '';
    this.statusFilter = '';
    this.goalFilter   = '';
  }

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private patientsSvc: PatientsSupabaseService,
  ) {}

  onEdit(p: PatientCard): void {
    this.router.navigate(['/patients', p.id]);
  }

  onDelete(p: PatientCard): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { name: p.name },
    });

    ref.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (!confirmed) return;
      try {
        await this.patientsSvc.delete(p.id);
        this.patients = this.patients.filter(x => x.id !== p.id);
      } catch (e: any) {
        console.error('Error al eliminar:', e?.message);
      }
    });
  }

  goToNewPatient(): void {
    this.router.navigate(['/patients/new']);
  }
}
