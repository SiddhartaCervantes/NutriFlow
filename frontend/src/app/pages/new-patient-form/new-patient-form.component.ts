import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PatientsSupabaseService } from '../../data/patients.supabase.service';

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
  actividad: string;
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
  private patientsApi = inject(PatientsSupabaseService);

  // (si aún quieres mantenerlos, no estorban)
  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<PatientFormData>();

  currentStep: StepId = 1;
  showSuccess = false;

  saving = false;
  errorMsg = '';

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
    actividad: ['Ligero', Validators.required],
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
    if (step < this.currentStep) this.currentStep = step;
  }

  prev() {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as StepId;
    } else {
      // si prefieres navegar directo:
      // this.goToList();
      this.back.emit();
    }
  }

  async next() {
    this.errorMsg = '';
    if (!this.validateStep(this.currentStep)) return;

    if (this.currentStep < 3) {
      this.currentStep = (this.currentStep + 1) as StepId;
      return;
    }

    // Paso 3: Guardar
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

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
      actividad: this.form.value.actividad ?? 'Ligero',
      estado: this.form.value.estado as 'Activo' | 'Inactivo',
      notas: this.form.value.notas ?? '',
    };

    try {
      this.saving = true;
      this.showSuccess = true;

      // 🔥 Supabase insert
      await this.patientsApi.create({
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: payload.email || undefined,
        telefono: payload.telefono || undefined,
        edad: payload.edad || undefined,
        genero: payload.genero || undefined,
        peso: payload.peso || undefined,
        altura: payload.altura || undefined,
        objetivo: payload.objetivo || undefined,
        actividad: payload.actividad || 'Ligero',
        estado: payload.estado,
        notas: payload.notas || undefined,
      });

      // opcional: mantener tu output (por si la página padre escucha)
      this.save.emit(payload);

      // vuelve a lista
      setTimeout(() => this.goToList(), 700);
    } catch (e: any) {
      this.showSuccess = false;
      this.errorMsg = e?.message ?? 'Error al guardar paciente';
      console.error(e);
    } finally {
      this.saving = false;
    }
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