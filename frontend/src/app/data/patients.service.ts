import { Injectable } from '@angular/core';
import { PatientCard } from '../components/patient/patient-card.component';

export type PatientDetail = {
  id: string;
  name: string;
  code: string;
  age: number;
  goal: string;
  lastUpdate: string;
  status: 'Activo' | 'Inactivo';
};

@Injectable({ providedIn: 'root' })
export class PatientsService {

  private readonly patients: PatientDetail[] = [
    {
      id: '1',
      name: 'María López',
      code: 'NF-1024',
      age: 28,
      goal: 'Pérdida de grasa',
      lastUpdate: 'Feb 2026',
      status: 'Activo',
    },
    {
      id: '2',
      name: 'Alejandro Cova',
      code: 'NF-1025',
      age: 34,
      goal: 'Aumento de masa muscular',
      lastUpdate: 'Ene 2026',
      status: 'Activo',
    },
    {
      id: '3',
      name: 'Karen López',
      code: 'NF-1026',
      age: 22,
      goal: 'Mejorar hábitos alimenticios',
      lastUpdate: 'Dic 2025',
      status: 'Inactivo',
    },
  ];

  /** Lista para cards */
  getAll(): PatientCard[] {
    return this.patients.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      goal: p.goal,
      status: p.status,
    }));
  }


  /** Detalle completo */
  getById(id: string): PatientDetail | undefined {
    return this.patients.find(p => p.id === id);
  }

  /** Crear nuevo paciente (temporal) */
  add(patient: PatientDetail) {
    this.patients.push(patient);
  }

  /** Actualizar paciente */
  update(id: string, changes: Partial<PatientDetail>) {
    const patient = this.getById(id);
    if (patient) {
      Object.assign(patient, changes);
    }
  }

  /** Eliminar paciente */
  delete(id: string) {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients.splice(index, 1);
    }
  }
}
