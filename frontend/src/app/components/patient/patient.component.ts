import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientListComponent } from '../patientsList/patientsList.component';
import { PatientsSupabaseService } from '../../data/patients.supabase.service';
import { PatientCard } from './patient-card.component';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [CommonModule, PatientListComponent],
  template: `
    @if (loading) {
      <div style="padding:40px; text-align:center; opacity:.6">Cargando pacientes...</div>
    }
    @if (error) {
      <div style="padding:40px; color:#c62828">{{ error }}</div>
    }
    @if (!loading && !error) {
      <app-patient-list [patients]="patients" />
    }
  `,
})
export class PatientsPageComponent implements OnInit {
  patients: PatientCard[] = [];
  loading = true;
  error = '';

  constructor(private patientsSvc: PatientsSupabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      const rows = await this.patientsSvc.getAll();
      this.patients = rows.map(p => ({
        id:       p.id,
        name:     `${p.nombre} ${p.apellido}`,
        age:      p.edad ?? 0,
        goal:     p.objetivo ?? '—',
        status:   p.estado,
        photoUrl: p.photo_url,
      }));
      console.log('[PatientsPage] photoUrls:', this.patients.map(p => ({ name: p.name, photoUrl: p.photoUrl })));
    } catch (e: any) {
      this.error = e?.message ?? 'Error al cargar pacientes.';
    } finally {
      this.loading = false;
    }
  }
}
