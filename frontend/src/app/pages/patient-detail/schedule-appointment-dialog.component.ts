import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppointmentService, AppointmentRow, NewAppointment } from '../../data/appointment.service';

export interface ScheduleAppointmentData {
  patientId: string;
  patientName: string;
}

type CellState = 'free' | 'occupied' | 'past';

type GridCell = {
  iso: string;
  slot: string;
  state: CellState;
  occupantName: string | null;
};

type GridRow = {
  slot: string;
  cells: GridCell[];
};

type DayHeader = {
  iso: string;
  weekday: string;
  day: number;
  isToday: boolean;
};

@Component({
  selector: 'app-schedule-appointment-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      Agendar cita
      <span style="font-weight:400; opacity:.6"> — {{ data.patientName }}</span>
    </h2>

    <mat-dialog-content>
      <div class="sched-body">

        <!-- Week navigation -->
        <div class="week-nav">
          <button mat-icon-button (click)="prevWeek()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="week-label">{{ weekLabel }}</span>
          <button mat-icon-button (click)="nextWeek()">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        @if (loading) {
          <mat-progress-bar mode="indeterminate" style="margin-bottom:8px; border-radius:4px">
          </mat-progress-bar>
        }

        <!-- Calendar grid -->
        <div class="cal-scroll">
          <div class="cal-grid">

            <!-- Header -->
            <div class="cal-corner"></div>
            @for (d of days; track d.iso) {
              <div class="cal-dayhead" [class.cal-dayhead--today]="d.isToday">
                <span class="cal-wd">{{ d.weekday }}</span>
                <span class="cal-num" [class.cal-num--today]="d.isToday">{{ d.day }}</span>
              </div>
            }

            <!-- Rows -->
            @for (row of grid; track row.slot) {
              <div class="cal-time">{{ row.slot }}</div>
              @for (cell of row.cells; track cell.iso) {
                <div class="cal-cell"
                     [class.cal-cell--free]="cell.state === 'free'"
                     [class.cal-cell--occupied]="cell.state === 'occupied'"
                     [class.cal-cell--past]="cell.state === 'past'"
                     [class.cal-cell--selected]="selectedKey === cell.iso + '|' + cell.slot"
                     (click)="selectCell(cell)">
                  @if (cell.occupantName) {
                    <span class="cal-event">{{ cell.occupantName }}</span>
                  }
                </div>
              }
            }

          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <span class="leg leg--free">Disponible</span>
          <span class="leg leg--occ">Ocupado</span>
          <span class="leg leg--past">Pasado</span>
          <span class="leg leg--sel">Seleccionado</span>
        </div>

        <!-- Selected slot info -->
        @if (selectedKey) {
          <div class="selected-bar">
            <mat-icon>event_available</mat-icon>
            <span>
              <strong>{{ selectedDateLabel }}</strong>&nbsp;·&nbsp;
              <strong>{{ selectedTime }}</strong> hrs
            </span>
          </div>
        }

        <!-- Mode + note -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Modalidad</mat-label>
            <mat-select [(ngModel)]="mode">
              <mat-option value="Presencial">Presencial</mat-option>
              <mat-option value="Online">Online</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Nota (opcional)</mat-label>
            <input matInput [(ngModel)]="note" placeholder="Motivo de consulta...">
          </mat-form-field>
        </div>

      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="!selectedKey"
              (click)="confirm()">
        <mat-icon>event</mat-icon>
        Confirmar cita
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .sched-body {
      padding: 4px 0 8px;
      max-height: 74vh;
      overflow-y: auto;
    }

    /* ── Week nav ─────────────────────── */
    .week-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .week-label {
      font-weight: 700;
      font-size: 14px;
      text-transform: capitalize;
    }

    /* ── Scroll wrapper ───────────────── */
    .cal-scroll {
      overflow-x: auto;
      border: 1px solid rgba(0,0,0,0.10);
      border-radius: 12px;
      margin-bottom: 10px;
    }

    /* ── Grid ─────────────────────────── */
    .cal-grid {
      display: grid;
      grid-template-columns: 52px repeat(7, minmax(90px, 1fr));
      min-width: 682px;
    }

    /* ── Header ───────────────────────── */
    .cal-corner {
      background: rgba(0,0,0,0.03);
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .cal-dayhead {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 4px 6px;
      background: rgba(0,0,0,0.03);
      border-bottom: 1px solid rgba(0,0,0,0.08);
      border-left: 1px solid rgba(0,0,0,0.06);
    }
    .cal-dayhead--today { background: rgba(25,118,210,0.07); }
    .cal-wd {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      opacity: .5;
    }
    .cal-num {
      font-size: 16px;
      font-weight: 800;
      line-height: 1.3;
    }
    .cal-num--today { color: #1565c0; }

    /* ── Time labels ──────────────────── */
    .cal-time {
      font-size: 10px;
      color: rgba(0,0,0,0.40);
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 6px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      background: rgba(0,0,0,0.01);
      font-weight: 600;
      user-select: none;
    }

    /* ── Cells ────────────────────────── */
    .cal-cell {
      height: 42px;
      border-left: 1px solid rgba(0,0,0,0.06);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      padding: 3px 5px;
      overflow: hidden;
      position: relative;
      user-select: none;
    }
    .cal-cell--free {
      cursor: pointer;
    }
    .cal-cell--free:hover {
      background: rgba(25,118,210,0.10);
    }
    .cal-cell--occupied {
      background: rgba(25,118,210,0.13);
      cursor: not-allowed;
    }
    .cal-cell--past {
      background: repeating-linear-gradient(
        -45deg,
        rgba(0,0,0,0.02),
        rgba(0,0,0,0.02) 4px,
        transparent 4px,
        transparent 8px
      );
      cursor: default;
    }
    .cal-cell--selected {
      background: rgba(25,118,210,0.22) !important;
      box-shadow: inset 0 0 0 2px #1976d2;
      cursor: pointer;
    }

    .cal-event {
      font-size: 10px;
      font-weight: 700;
      color: #1565c0;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.3;
    }

    /* ── Legend ───────────────────────── */
    .legend {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .leg {
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      opacity: .75;
    }
    .leg::before {
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 3px;
      display: inline-block;
    }
    .leg--free::before  { background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.15); }
    .leg--occ::before   { background: rgba(25,118,210,0.20); }
    .leg--past::before  {
      background: repeating-linear-gradient(
        -45deg, rgba(0,0,0,0.08), rgba(0,0,0,0.08) 2px, transparent 2px, transparent 4px
      );
      border: 1px solid rgba(0,0,0,0.12);
    }
    .leg--sel::before   { background: rgba(25,118,210,0.22); box-shadow: inset 0 0 0 2px #1976d2; }

    /* ── Selected bar ─────────────────── */
    .selected-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(25,118,210,0.08);
      color: #1565c0;
      font-size: 14px;
      margin-bottom: 12px;
    }

    /* ── Bottom form ──────────────────── */
    .form-row {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 12px;
    }
  `],
})
export class ScheduleAppointmentDialogComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  loading = true;
  mode: 'Presencial' | 'Online' = 'Presencial';
  note = '';
  selectedKey: string | null = null; // "YYYY-MM-DD|HH:MM"

  days: DayHeader[] = [];
  grid: GridRow[] = [];

  private weekStart: Date;
  private occupied = new Map<string, string>(); // key → patientName

  readonly timeSlots = [
    '08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00','19:00',
  ];

  constructor(
    private dialogRef: MatDialogRef<ScheduleAppointmentDialogComponent, NewAppointment>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleAppointmentData,
  ) {
    this.weekStart = this.getMonday(new Date());
  }

  async ngOnInit(): Promise<void> {
    try {
      const rows: AppointmentRow[] = await this.appointmentService.getAll();
      for (const row of rows) {
        const dt = new Date(row.date_time);
        const key = `${this.toIso(dt)}|${String(dt.getHours()).padStart(2, '0')}:00`;
        this.occupied.set(key, row.patient_name);
      }
    } finally {
      this.loading = false;
      this.buildGrid();
    }
  }

  // ── Grid construction ──────────────────────────────────────────────────────
  private buildGrid(): void {
    const todayIso = this.toIso(new Date());
    const now = new Date();

    this.days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      const iso = this.toIso(d);
      return {
        iso,
        weekday: d.toLocaleDateString('es-MX', { weekday: 'short' }),
        day: d.getDate(),
        isToday: iso === todayIso,
      };
    });

    this.grid = this.timeSlots.map(slot => {
      const [h] = slot.split(':').map(Number);
      const cells: GridCell[] = this.days.map(day => {
        const key = `${day.iso}|${slot}`;
        const occupant = this.occupied.get(key) ?? null;

        if (occupant) {
          return { iso: day.iso, slot, state: 'occupied', occupantName: occupant };
        }

        const slotEnd = new Date(`${day.iso}T${slot}:00`);
        slotEnd.setHours(h, 59, 59, 999);
        if (slotEnd < now) {
          return { iso: day.iso, slot, state: 'past', occupantName: null };
        }

        return { iso: day.iso, slot, state: 'free', occupantName: null };
      });

      return { slot, cells };
    });
  }

  // ── Cell interaction ───────────────────────────────────────────────────────
  selectCell(cell: GridCell): void {
    if (cell.state !== 'free') return;
    const key = `${cell.iso}|${cell.slot}`;
    this.selectedKey = this.selectedKey === key ? null : key;
  }

  // ── Selected slot display ──────────────────────────────────────────────────
  get selectedDateLabel(): string {
    if (!this.selectedKey) return '';
    const [iso] = this.selectedKey.split('|');
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  get selectedTime(): string {
    if (!this.selectedKey) return '';
    return this.selectedKey.split('|')[1];
  }

  // ── Week navigation ────────────────────────────────────────────────────────
  get weekLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    return `${fmt(this.weekStart)} – ${fmt(end)} ${this.weekStart.getFullYear()}`;
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.selectedKey = null;
    this.buildGrid();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.selectedKey = null;
    this.buildGrid();
  }

  // ── Confirm ────────────────────────────────────────────────────────────────
  confirm(): void {
    if (!this.selectedKey) return;
    const [iso, slot] = this.selectedKey.split('|');
    this.dialogRef.close({
      patient_id:   this.data.patientId,
      patient_name: this.data.patientName,
      date_time:    `${iso}T${slot}:00`,
      mode:         this.mode,
      note:         this.note.trim() || null,
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
