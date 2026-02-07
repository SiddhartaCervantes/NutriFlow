import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

type Appointment = {
  id: string;
  patient: string;
  dateTime: Date;
  mode: 'Online' | 'Presencial';
  note?: string;
};

@Component({
  selector: 'app-next-appointment-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatDividerModule],
  templateUrl: './next-appointment-card.component.html',
  styleUrl: './next-appointment-card.component.css',
})
export class NextAppointmentCardComponent {
  @Input({ required: true }) appointment: Appointment | null = null;

  formatDate(dt: Date) {
    return dt.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(dt: Date) {
    return dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}
