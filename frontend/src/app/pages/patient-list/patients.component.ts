import { Component } from '@angular/core';
import { PatientListComponent } from '../../components/patientsList/patientsList.component';
import { PatientsService } from '../../data/patients.service';
import { PatientCard } from '../../components/patient/patient-card.component';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [PatientListComponent],
  template: `
    <app-patient-list [patients]="patients" />
  `,
})
export class PatientsComponent {
  patients: PatientCard[] = [];

  constructor(private patientsSvc: PatientsService) {
    this.patients = this.patientsSvc.getAll(); // ✅ ya debe regresar PatientCard[]
  }
}
