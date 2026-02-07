import { Component } from '@angular/core';
import { PatientListComponent } from '../patientsList/patientsList.component';
import { PatientsService } from '../../data/patients.service';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [PatientListComponent],
  template: `
    <app-patient-list
      [patients]="patientsUi"
      (selectPatient)="onSelect($event.id)"
    />
  `,
})
export class PatientsPageComponent {
  patientsUi: { id: string; fullName: string; subtitle: string }[] = [];

  constructor(private patientsSvc: PatientsService) {
    this.patientsUi = this.patientsSvc.getAll().map(p => ({
      id: String(p.id), 
      fullName: p.fullName,
      subtitle: p.subtitle ?? 'datos de PACIENTE',
    }));

    console.log('patientsUi:', this.patientsUi);
  }

  onSelect(id: string) {
    console.log('Paciente seleccionado:', this.patientsSvc.getById(id));
  }
}
