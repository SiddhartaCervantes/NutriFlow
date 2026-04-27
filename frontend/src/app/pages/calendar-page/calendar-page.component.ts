import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NextAppointmentCardComponent } from '../../components/next-appointment-card/next-appointment-card.component';
import { AppointmentService, AppointmentRow } from '../../data/appointment.service';

type CalCell = {
  iso: string;
  slot: string;
  isPast: boolean;
  appointment: AppointmentRow | null;
};

type CalRow = {
  slot: string;
  cells: CalCell[];
};

type DayHeader = {
  iso: string;
  weekday: string;
  dayNum: number;
  monthLabel: string;
  isToday: boolean;
};

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    NextAppointmentCardComponent,
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.css',
})
export class CalendarPageComponent implements OnInit {

  loading = true;
  deletingId: string | null = null;

  days: DayHeader[] = [];
  grid: CalRow[] = [];

  private weekStart!: Date;
  private appointments: AppointmentRow[] = [];

  readonly timeSlots = [
    '07:00','08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00',
  ];

  constructor(
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit(): Promise<void> {
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      const [y, m, d] = dateParam.split('-').map(Number);
      this.weekStart = this.getMonday(new Date(y, m - 1, d));
    } else {
      this.weekStart = this.getMonday(new Date());
    }

    try {
      this.appointments = await this.appointmentService.getAll();
    } catch {
      this.appointments = [];
    } finally {
      this.loading = false;
      this.buildGrid();
    }
  }

  // ── Grid ───────────────────────────────────────────────────────────────────
  private buildGrid(): void {
    const todayIso = this.toIso(new Date());
    const now = new Date();

    this.days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      const iso = this.toIso(d);
      return {
        iso,
        weekday: d.toLocaleDateString('es-MX', { weekday: 'long' }),
        dayNum:  d.getDate(),
        monthLabel: d.toLocaleDateString('es-MX', { month: 'short' }),
        isToday: iso === todayIso,
      };
    });

    // Index appointments by "iso|HH:00"
    const apptMap = new Map<string, AppointmentRow>();
    for (const a of this.appointments) {
      const dt = new Date(a.date_time);
      const key = `${this.toIso(dt)}|${String(dt.getHours()).padStart(2, '0')}:00`;
      if (!apptMap.has(key)) apptMap.set(key, a);
    }

    this.grid = this.timeSlots.map(slot => {
      const [h] = slot.split(':').map(Number);
      const cells: CalCell[] = this.days.map(day => {
        const slotEnd = new Date(`${day.iso}T${slot}:00`);
        slotEnd.setHours(h, 59, 59, 999);
        return {
          iso:         day.iso,
          slot,
          isPast:      slotEnd < now,
          appointment: apptMap.get(`${day.iso}|${slot}`) ?? null,
        };
      });
      return { slot, cells };
    });
  }

  // ── Appointment actions ────────────────────────────────────────────────────
  async deleteAppointment(id: string, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    this.deletingId = id;
    try {
      await this.appointmentService.delete(id);
      this.appointments = this.appointments.filter(a => a.id !== id);
      this.buildGrid();
    } finally {
      this.deletingId = null;
    }
  }

  // ── Week navigation ────────────────────────────────────────────────────────
  get weekLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    return `${fmt(this.weekStart)} – ${fmt(end)}, ${this.weekStart.getFullYear()}`;
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.buildGrid();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.buildGrid();
  }

  goToday(): void {
    this.weekStart = this.getMonday(new Date());
    this.buildGrid();
  }

  // ── Next appointment (for card) ────────────────────────────────────────────
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

  // ── Utils ──────────────────────────────────────────────────────────────────
  formatApptTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
