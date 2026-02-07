import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NextAppointmentCardComponent } from '../../components/next-appointment-card/next-appointment-card.component';
import { CalendarToolbarComponent } from '../../components/calendar-toolbar/calendar-toolbar.component';
import { MonthGridComponent, CalendarCell, CalendarEvent } from '../../components/month-grid/month-grid.component';

type Appointment = {
  id: string;
  patient: string;
  dateTime: Date;
  mode: 'Online' | 'Presencial';
  note?: string;
};

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, NextAppointmentCardComponent, CalendarToolbarComponent, MonthGridComponent],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.css',
})
export class CalendarPageComponent {
  // Current month anchor (1st day of the month)
  monthAnchor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  // Dummy appointments (later from API)
  appointments: Appointment[] = [
    { id: 'a1', patient: 'María López', dateTime: this.at(2026, 2, 9, 17, 30), mode: 'Online', note: 'Revisión de plan' },
    { id: 'a2', patient: 'Carlos Ramírez', dateTime: this.at(2026, 2, 12, 10, 0), mode: 'Presencial' },
    { id: 'a3', patient: 'Ana Torres', dateTime: this.at(2026, 2, 12, 18, 0), mode: 'Online' },
  ];

  get nextAppointment(): Appointment | null {
    const now = new Date();
    const upcoming = this.appointments
      .filter(a => a.dateTime.getTime() >= now.getTime())
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    return upcoming[0] ?? null;
  }

  get monthLabel(): string {
    return this.monthAnchor.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  get eventsForGrid(): CalendarEvent[] {
    return this.appointments.map(a => ({
      id: a.id,
      title: a.patient,
      dateTime: a.dateTime,
      badge: a.mode,
    }));
  }

  onPrevMonth() {
    this.monthAnchor = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() - 1, 1);
  }

  onNextMonth() {
    this.monthAnchor = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() + 1, 1);
  }

  onToday() {
    const t = new Date();
    this.monthAnchor = new Date(t.getFullYear(), t.getMonth(), 1);
  }

  onSelectCell(cell: CalendarCell) {
    // later: open day agenda / dialog
    console.log('Selected day:', cell.iso);
  }

  onSelectEvent(ev: CalendarEvent) {
    // later: open appointment detail
    console.log('Selected event:', ev.id);
  }

  private at(y: number, m: number, d: number, hh: number, mm: number) {
    // m is 1-based for readability (Feb=2)
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  }
}
