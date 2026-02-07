import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type CalendarCell = {
  date: Date;
  dayNumber: number;
  inMonth: boolean;
  iso: string; // YYYY-MM-DD
};

export type CalendarEvent = {
  id: string;
  title: string;
  dateTime: Date;
  badge?: string;
};

@Component({
  selector: 'app-month-grid',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './month-grid.component.html',
  styleUrl: './month-grid.component.css',
})
export class MonthGridComponent implements OnChanges {
  @Input({ required: true }) monthAnchor!: Date; // first day of month
  @Input() events: CalendarEvent[] = [];

  @Output() selectCell = new EventEmitter<CalendarCell>();
  @Output() selectEvent = new EventEmitter<CalendarEvent>();

  weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  cells: CalendarCell[] = [];
  private eventsByIso = new Map<string, CalendarEvent[]>();

  ngOnChanges(): void {
    this.buildEventsIndex();
    this.cells = this.buildMonthCells(this.monthAnchor);
  }

  getEventsForCell(cell: CalendarCell): CalendarEvent[] {
    return this.eventsByIso.get(cell.iso) ?? [];
  }

  onCellClick(cell: CalendarCell) {
    this.selectCell.emit(cell);
  }

  onEventClick(ev: CalendarEvent, e: MouseEvent) {
    e.stopPropagation();
    this.selectEvent.emit(ev);
  }

  private buildEventsIndex() {
    this.eventsByIso.clear();
    for (const ev of this.events) {
      const iso = this.toIsoDate(ev.dateTime);
      const list = this.eventsByIso.get(iso) ?? [];
      list.push(ev);
      this.eventsByIso.set(iso, list);
    }
    // sort each day by time
    for (const [k, list] of this.eventsByIso.entries()) {
      list.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      this.eventsByIso.set(k, list);
    }
  }

  private buildMonthCells(anchor: Date): CalendarCell[] {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    // Convert JS day (Sun=0) into Monday-based (Mon=0..Sun=6)
    const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

    // Start from the Monday of the first week shown
    const start = new Date(first);
    start.setDate(first.getDate() - mondayIndex(first));

    // End on the Sunday of the last week shown
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - mondayIndex(last)));

    const out: CalendarCell[] = [];
    const cursor = new Date(start);

    while (cursor.getTime() <= end.getTime()) {
      out.push({
        date: new Date(cursor),
        dayNumber: cursor.getDate(),
        inMonth: cursor.getMonth() === m,
        iso: this.toIsoDate(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return out;
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
