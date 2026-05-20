import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NextAppointmentCardComponent } from '../../components/next-appointment-card/next-appointment-card.component';
import { CalendarToolbarComponent } from '../../components/calendar-toolbar/calendar-toolbar.component';
import { MonthGridComponent, CalendarCell, CalendarEvent } from '../../components/month-grid/month-grid.component';
import { AppointmentService, AppointmentRow } from '../../data/appointment.service';
import { AppointmentDialogComponent, AppointmentDialogResult } from '../../components/appointment-dialog/appointment-dialog.component';
import { NewAppointmentDialogComponent } from '../../components/new-appointment-dialog/new-appointment-dialog.component';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NextAppointmentCardComponent,
    CalendarToolbarComponent,
    MonthGridComponent,
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.css',
})
export class CalendarPageComponent implements OnInit {

  loading = true;
  monthAnchor!: Date;
  appointments: AppointmentRow[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  async ngOnInit(): Promise<void> {
    const now = new Date();
    this.monthAnchor = new Date(now.getFullYear(), now.getMonth(), 1);
    try {
      this.appointments = await this.appointmentService.getAll();
    } catch {
      this.appointments = [];
    } finally {
      this.loading = false;
    }
  }

  // ── Toolbar ────────────────────────────────────────────────────────────────
  get monthLabel(): string {
    return this.monthAnchor.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  onPrevMonth(): void {
    const d = new Date(this.monthAnchor);
    d.setMonth(d.getMonth() - 1);
    this.monthAnchor = new Date(d.getFullYear(), d.getMonth(), 1);
  }

  onToday(): void {
    const now = new Date();
    this.monthAnchor = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  onNextMonth(): void {
    const d = new Date(this.monthAnchor);
    d.setMonth(d.getMonth() + 1);
    this.monthAnchor = new Date(d.getFullYear(), d.getMonth(), 1);
  }

  // ── Grid ───────────────────────────────────────────────────────────────────
  get eventsForGrid(): CalendarEvent[] {
    return this.appointments.map(a => ({
      id:       a.id,
      title:    a.patient_name,
      dateTime: new Date(a.date_time),
      badge:    a.mode,
    }));
  }

  onSelectCell(cell: CalendarCell): void {
    this.dialog
      .open(NewAppointmentDialogComponent, { data: { isoDate: cell.iso, existing: this.appointments }, width: '420px' })
      .afterClosed()
      .subscribe(async (appt) => {
        if (!appt) return;
        try {
          const created = await this.appointmentService.add(appt);
          this.appointments = [...this.appointments, created];
        } catch {
          alert('No se pudo agendar la cita. Intenta de nuevo.');
        }
      });
  }

  onSelectEvent(event: CalendarEvent): void {
    const appt = this.appointments.find(a => a.id === event.id);
    if (!appt) return;
    this.openAppointmentDialog(appt);
  }

  // ── Next appointment card ──────────────────────────────────────────────────
  get nextAppointment(): AppointmentRow | null {
    const now = new Date();
    return this.appointments
      .filter(a => new Date(a.date_time) >= now)
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())[0] ?? null;
  }

  onEditNext(): void {
    const appt = this.nextAppointment;
    if (appt) this.openAppointmentDialog(appt);
  }

  // ── Dialog ─────────────────────────────────────────────────────────────────
  private openAppointmentDialog(appt: AppointmentRow): void {
    this.dialog
      .open(AppointmentDialogComponent, { data: appt, width: '420px' })
      .afterClosed()
      .subscribe(async (result: AppointmentDialogResult) => {
        if (!result) return;

        if (result.action === 'save') {
          try {
            const updated = await this.appointmentService.update(appt.id, result.changes);
            this.appointments = this.appointments.map(a => a.id === appt.id ? updated : a);
          } catch {
            alert('No se pudo actualizar la cita. Intenta de nuevo.');
          }
        }

        if (result.action === 'cancel') {
          try {
            await this.appointmentService.delete(appt.id);
            this.appointments = this.appointments.filter(a => a.id !== appt.id);
          } catch {
            alert('No se pudo cancelar la cita. Intenta de nuevo.');
          }
        }
      });
  }
}
