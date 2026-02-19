import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule} from '@angular/router';

export type PatientFormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  edad: number;
  genero: string;
  peso: number;
  altura: number;
  objetivo: string;
  estado: 'Activo' | 'Inactivo';
  notas: string;
};

type StepId = 1 | 2 | 3;

@Component({
  selector: 'app-new-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './new-patient-form.component.html',
  styleUrls: ['./new-patient-form.component.scss'],
})
export class NewPatientFormComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<PatientFormData>();

  currentStep: StepId = 1;
  showSuccess = false;
  
  goToList() {
    this.router.navigate(['/patients']);
    
    }


  readonly steps = [
    { id: 1 as StepId, label: 'Personal', icon: 'person_add' },
    { id: 2 as StepId, label: 'Salud', icon: 'favorite' },
    { id: 3 as StepId, label: 'Notas', icon: 'description' },
  ];

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', Validators.email],
    telefono: [''],
    edad: [0, [Validators.required, Validators.min(1), Validators.max(120)]],
    genero: ['', Validators.required],
    peso: [0],
    altura: [0],
    objetivo: ['', Validators.required],
    estado: ['Activo' as 'Activo' | 'Inactivo'],
    notas: [''],
  });

  // ===== Progress =====
  get progressPct(): number {
    return (this.currentStep / 3) * 100;
  }

  // ===== BMI =====
  get bmiValue(): number | null {
    const peso = Number(this.form.value.peso ?? 0);
    const altura = Number(this.form.value.altura ?? 0);

    if (peso > 0 && altura > 0) {
      const m = altura / 100;
      return peso / (m * m);
    }
    return null;
  }

  get bmiLabel(): string {
    const bmi = this.bmiValue;
    if (!bmi) return '';
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  // ===== Validation per step =====
  private controlsForStep(step: StepId): string[] {
    if (step === 1) return ['nombre', 'apellido', 'edad', 'genero', 'email'];
    if (step === 2) return ['objetivo'];
    return [];
  }

  validateStep(step: StepId): boolean {
    const keys = this.controlsForStep(step);

    keys.forEach(k => {
      const control = this.form.get(k);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });

    return keys.every(k => !this.form.get(k)?.invalid);
  }

  goToStep(step: StepId) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  prev() {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as StepId;
    } else {
      this.back.emit();
    }
  }

  next() {
    if (!this.validateStep(this.currentStep)) return;

    if (this.currentStep < 3) {
      this.currentStep = (this.currentStep + 1) as StepId;
      return;
    }

    // Success animation
    this.showSuccess = true;

    const payload: PatientFormData = {
      nombre: this.form.value.nombre ?? '',
      apellido: this.form.value.apellido ?? '',
      email: this.form.value.email ?? '',
      telefono: this.form.value.telefono ?? '',
      edad: Number(this.form.value.edad ?? 0),
      genero: this.form.value.genero ?? '',
      peso: Number(this.form.value.peso ?? 0),
      altura: Number(this.form.value.altura ?? 0),
      objetivo: this.form.value.objetivo ?? '',
      estado: this.form.value.estado as 'Activo' | 'Inactivo',
      notas: this.form.value.notas ?? '',
    };

    setTimeout(() => {
      this.save.emit(payload);
      this.showSuccess = false;
      this.currentStep = 1;
      this.form.reset({
        edad: 0,
        peso: 0,
        altura: 0,
        estado: 'Activo'
      });
    }, 1200);
  }

  // ===== Error helper =====
  err(name: keyof PatientFormData): string | null {
    const control = this.form.get(name as string);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['min'] || control.errors['max']) return 'Valor inválido';

    return 'Campo inválido';
  }
}
