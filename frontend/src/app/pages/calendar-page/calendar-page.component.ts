import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NextAppointmentCardComponent } from '../../components/next-appointment-card/next-appointment-card.component';
import { CalendarToolbarComponent } from '../../components/calendar-toolbar/calendar-toolbar.component';
import { MonthGridComponent, CalendarCell, CalendarEvent } from '../../components/month-grid/month-grid.component';
import { AppointmentService, AppointmentRow } from '../../data/appointment.service';

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
  private appointments: AppointmentRow[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
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

  // ── Toolbar inputs ─────────────────────────────────────────────────────────
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

  // ── Grid inputs ────────────────────────────────────────────────────────────
  get eventsForGrid(): CalendarEvent[] {
    return this.appointments.map(a => ({
      id:       a.id,
      title:    a.patient_name,
      dateTime: new Date(a.date_time),
      badge:    a.mode,
    }));
  }

  onSelectCell(cell: CalendarCell): void {
    this.router.navigate(['/patients/new'], { queryParams: { date: cell.iso } });
  }

  onSelectEvent(event: CalendarEvent): void {
    this.router.navigate(['/calendar'], { queryParams: { appointment: event.id } });
  }

  // ── Next appointment card ──────────────────────────────────────────────────
  get nextAppointment(): { id: string; patient: string; dateTime: Date; mode: 'Online' | 'Presencial'; note?: string } | null {
    const now = new Date();
    const upcoming = this.appointments
      .map(a => ({ ...a, dateTime: new Date(a.date_time) }))
      .filter(a => a.dateTime >= now)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    if (!upcoming[0]) return null;
    return {
      id:       upcoming[0].id,
      patient:  upcoming[0].patient_name,
      dateTime: upcoming[0].dateTime,
      mode:     upcoming[0].mode,
      note:     upcoming[0].note ?? undefined,
    };
  }
}
