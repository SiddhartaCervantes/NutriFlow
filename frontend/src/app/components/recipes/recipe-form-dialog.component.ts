import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipeRow, RecipeInput } from '../../data/recipe.service';

export interface RecipeDialogData {
  recipe?: RecipeRow;
}

@Component({
  selector: 'app-recipe-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.recipe ? 'Editar receta' : 'Nueva receta' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="category">
              @for (cat of categories; track cat.value) {
                <mat-option [value]="cat.value">{{ cat.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Dificultad</mat-label>
            <mat-select formControlName="difficulty">
              @for (d of difficulties; track d) {
                <mat-option [value]="d">{{ d }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Tiempo preparación (min)</mat-label>
            <input matInput type="number" formControlName="prep_time_min" min="1" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Calorías (kcal)</mat-label>
            <input matInput type="number" formControlName="calories" min="0" />
          </mat-form-field>
        </div>

        <div class="row row--3">
          <mat-form-field appearance="outline">
            <mat-label>Proteína (g)</mat-label>
            <input matInput type="number" formControlName="protein_g" min="0" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Carbohidratos (g)</mat-label>
            <input matInput type="number" formControlName="carbs_g" min="0" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Grasas (g)</mat-label>
            <input matInput type="number" formControlName="fat_g" min="0" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Instrucciones (una por línea)</mat-label>
          <textarea matInput formControlName="instructions" rows="5"
            placeholder="1. Precalentar el horno&#10;2. Mezclar ingredientes..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>URL de imagen (opcional)</mat-label>
          <input matInput formControlName="image_url" />
        </mat-form-field>

        @if (error) {
          <p class="error">{{ error }}</p>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving">
        @if (saving) {
          <mat-spinner diameter="18"></mat-spinner>
        } @else {
          {{ data.recipe ? 'Guardar cambios' : 'Crear receta' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 480px;
      padding-top: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .row--3 {
      grid-template-columns: 1fr 1fr 1fr;
    }
    mat-form-field { width: 100%; }
    .error { color: #c62828; font-size: 13px; margin: 4px 0 0; }
    mat-spinner { display: inline-block; }
    @media (max-width: 540px) {
      .form { min-width: unset; }
      .row, .row--3 { grid-template-columns: 1fr; }
    }
  `],
})
export class RecipeFormDialogComponent {
  form: FormGroup;
  saving = false;
  error = '';

  readonly categories = [
    { value: 'desayuno', label: 'Desayuno' },
    { value: 'comida',   label: 'Comida' },
    { value: 'cena',     label: 'Cena' },
  ];
  readonly difficulties = ['Fácil', 'Medio', 'Difícil'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RecipeFormDialogComponent, RecipeInput | null>,
    @Inject(MAT_DIALOG_DATA) public data: RecipeDialogData,
  ) {
    const r = data.recipe;
    this.form = this.fb.group({
      name:         [r?.name ?? '',             Validators.required],
      description:  [r?.description ?? ''],
      category:     [r?.category ?? 'comida',   Validators.required],
      difficulty:   [r?.difficulty ?? 'Fácil'],
      prep_time_min:[r?.prep_time_min ?? 30,    [Validators.required, Validators.min(1)]],
      calories:     [r?.calories ?? 0,          [Validators.required, Validators.min(0)]],
      protein_g:    [r?.protein_g ?? 0,         Validators.min(0)],
      carbs_g:      [r?.carbs_g ?? 0,           Validators.min(0)],
      fat_g:        [r?.fat_g ?? 0,             Validators.min(0)],
      instructions: [r?.instructions ?? ''],
      image_url:    [r?.image_url ?? ''],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const val = this.form.getRawValue();
    const input: RecipeInput = {
      name:          val.name.trim(),
      description:   val.description?.trim() || null,
      category:      val.category,
      difficulty:    val.difficulty || null,
      prep_time_min: Number(val.prep_time_min),
      calories:      Number(val.calories),
      protein_g:     Number(val.protein_g),
      carbs_g:       Number(val.carbs_g),
      fat_g:         Number(val.fat_g),
      instructions:  val.instructions?.trim() || null,
      image_url:     val.image_url?.trim() || null,
    };
    this.dialogRef.close(input);
  }
}
