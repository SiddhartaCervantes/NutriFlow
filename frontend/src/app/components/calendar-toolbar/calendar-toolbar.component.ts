import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-calendar-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './calendar-toolbar.component.html',
  styleUrl: './calendar-toolbar.component.css',
})
export class CalendarToolbarComponent {
  @Input({ required: true }) monthLabel = '';

  @Output() prev = new EventEmitter<void>();
  @Output() today = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}