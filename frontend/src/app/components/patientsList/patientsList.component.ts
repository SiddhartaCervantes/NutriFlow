import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientCardComponent, PatientCard } from '../patient/patient-card.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, PatientCardComponent],
  templateUrl: './patientsList.component.html',
  styleUrls: ['./patientsList.component.scss'],
})
export class PatientListComponent {
  @Input() title = 'LISTA DE PACIENTES';
  @Input() patients: PatientCard[] = [];

  @Output() selectPatient = new EventEmitter<PatientCard>();
  @Output() addPatient = new EventEmitter<void>();

  constructor(private router: Router) {}

  onEdit(p: PatientCard) {
    console.log('EDIT', p);
  }

  onDelete(p: PatientCard) {
    console.log('DELETE', p);
  }

  goToNewPatient() {
  this.router.navigate(['/patients/new']);
}
}
