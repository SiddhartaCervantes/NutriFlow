import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PatientsSupabaseService, PatientRow } from '../../data/patients.supabase.service';
import { AppointmentService, AppointmentRow } from '../../data/appointment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private patientsService    = inject(PatientsSupabaseService);
  private appointmentService = inject(AppointmentService);

  loading = true;

  // Stats
  totalPatients  = 0;
  activePatients = 0;
  apptToday      = 0;
  apptWeek       = 0;

  // Lists
  upcomingAppointments: AppointmentRow[] = [];
  recentPatients: PatientRow[]           = [];

  async ngOnInit(): Promise<void> {
    try {
      const [patients, appointments] = await Promise.all([
        this.patientsService.getAll(),
        this.appointmentService.getAll(),
      ]);

      this.totalPatients  = patients.length;
      this.activePatients = patients.filter(p => p.estado === 'Activo').length;
      this.recentPatients = patients.slice(0, 6);

      const now       = new Date();
      const todayStr  = now.toISOString().slice(0, 10);
      const weekEnd   = new Date(now); weekEnd.setDate(now.getDate() + 7);

      const future = appointments.filter(a => new Date(a.date_time) >= now);
      this.upcomingAppointments = future.slice(0, 6);
      this.apptToday = future.filter(a => a.date_time.slice(0, 10) === todayStr).length;
      this.apptWeek  = future.filter(a => new Date(a.date_time) <= weekEnd).length;
    } finally {
      this.loading = false;
    }
  }

  initials(p: PatientRow): string {
    return `${p.nombre.charAt(0)}${p.apellido.charAt(0)}`.toUpperCase();
  }
}
