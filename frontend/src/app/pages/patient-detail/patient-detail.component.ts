import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

type MealSlot = {
  label: string;
  recipe?: string;
  notes?: string;
  kcal?: number;
  protein_g?: number;
};

type DayPlan = {
  day: DayKey;
  targetKcal?: number;
  targetProtein?: number;
  slots: MealSlot[];
  generalNotes?: string;
};

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressBarModule,
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css',
})
export class PatientDetailComponent {
  patient = {
    name: 'María López',
    code: 'NF-1024',
    age: 28,
    goal: 'Pérdida de grasa',
    lastUpdate: 'Feb 2026',
    status: 'Activo',
  };

  weekLabel = 'Semana 1 (Ejemplo)';

  days: { key: DayKey; label: string }[] = [
    { key: 'Mon', label: 'Lun' },
    { key: 'Tue', label: 'Mar' },
    { key: 'Wed', label: 'Mié' },
    { key: 'Thu', label: 'Jue' },
    { key: 'Fri', label: 'Vie' },
    { key: 'Sat', label: 'Sáb' },
    { key: 'Sun', label: 'Dom' },
  ];

  dayPlans: Record<DayKey, DayPlan> = {
    Mon: {
      day: 'Mon',
      targetKcal: 1800,
      targetProtein: 120,
      slots: [
        { label: 'Desayuno', recipe: 'Avena + Yogurt', kcal: 420, protein_g: 28 },
        { label: 'Comida', recipe: 'Pollo + Quinoa', kcal: 580, protein_g: 45 },
        { label: 'Cena', recipe: 'Ensalada + Atún', kcal: 430, protein_g: 35 },
      ],
      generalNotes: 'Tomar 2L de agua',
    },
    Tue: { day: 'Tue', targetKcal: 1800, targetProtein: 120, slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }] },
    Wed: { day: 'Wed', targetKcal: 1800, targetProtein: 120, slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }] },
    Thu: { day: 'Thu', targetKcal: 1800, targetProtein: 120, slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }] },
    Fri: { day: 'Fri', targetKcal: 1800, targetProtein: 120, slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }] },
    Sat: { day: 'Sat', targetKcal: 2000, targetProtein: 120, slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }] },
    Sun: { day: 'Sun', targetKcal: 2000, targetProtein: 120, slots: [{ label: 'Desayuno' }, { label: 'Comida' }, { label: 'Cena' }] },
  };

  adherence = {
    week: 0.62, // 62%
    mealsLogged: 11,
    mealsPlanned: 18,
  };

  measurements = [
    { label: 'Peso', value: '71.2 kg', meta: '(-0.8 kg)' },
    { label: 'Cintura', value: '78 cm', meta: '(-2 cm)' },
    { label: 'IMC', value: '24.6', meta: 'estable' },
  ];

  notes = [
    { date: '2026-02-02', text: 'Reducir ultraprocesados. Añadir caminata 20 min.' },
    { date: '2026-01-26', text: 'Revisión de tolerancia a lácteos.' },
  ];

    getSlot(day: DayKey, label: string): MealSlot | undefined {
    return this.dayPlans[day].slots.find(s => s.label === label);
  }

  // UI-only handlers (later route/dialog)
  onEditPatient() {}
  onNewWeek() {}
  onPrevWeek() {}
  onNextWeek() {}
  onExport() {}
  onAddMeal(day: DayKey) {}
}
