import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RecipeService, RecipeRow } from '../../data/recipe.service';

export interface AssignMealData {
  day: string;
  dayLabel: string;
  slot: string;
}

const SLOT_TO_CATEGORY: Record<string, string> = {
  'Desayuno': 'desayuno',
  'Comida':   'comida',
  'Cena':     'cena',
};

@Component({
  selector: 'app-assign-meal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      Asignar receta
      <span style="font-weight:400; opacity:.65"> — {{ data.slot }} · {{ data.dayLabel }}</span>
    </h2>

    <mat-dialog-content style="min-width:440px; padding-top:8px">

      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Buscar receta</mat-label>
        <input matInput [(ngModel)]="query" placeholder="Nombre de la receta...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      @if (loading) {
        <div style="padding:16px 0">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p style="margin-top:10px; opacity:.6; font-size:13px; text-align:center">
            Cargando recetas...
          </p>
        </div>
      }

      @if (!loading && filtered.length === 0) {
        <p style="text-align:center; opacity:.5; padding:20px 0; font-size:14px">
          No hay recetas disponibles para este filtro.
        </p>
      }

      @if (!loading && filtered.length > 0) {
        <div class="recipe-list">
          @for (r of filtered; track r.id) {
            <div class="recipe-item"
                 [class.recipe-item--selected]="selected?.id === r.id"
                 (click)="select(r)">
              <div class="recipe-item__left">
                <div class="recipe-item__name">{{ r.name }}</div>
                <div class="recipe-item__meta">
                  <span>{{ r.protein_g }}g prot</span>
                  <span class="dot">·</span>
                  <span>{{ r.carbs_g }}g carbs</span>
                  <span class="dot">·</span>
                  <span>{{ r.fat_g }}g grasas</span>
                  <span class="dot">·</span>
                  <span>{{ r.prep_time_min }} min</span>
                </div>
              </div>
              <div class="recipe-item__kcal">
                {{ r.calories }}<br>
                <span style="font-size:10px; font-weight:600; opacity:.6">kcal</span>
              </div>
            </div>
          }
        </div>
      }

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="!selected"
              (click)="confirm()">
        <mat-icon>check</mat-icon>
        Asignar receta
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .recipe-list {
      display: grid;
      gap: 6px;
      max-height: 340px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .recipe-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1.5px solid transparent;
      background: rgba(0,0,0,0.03);
      cursor: pointer;
      transition: background 140ms, border-color 140ms;
    }

    .recipe-item:hover {
      background: rgba(25, 118, 210, 0.06);
      border-color: rgba(25, 118, 210, 0.2);
    }

    .recipe-item--selected {
      background: rgba(25, 118, 210, 0.10) !important;
      border-color: #1976d2 !important;
    }

    .recipe-item__name {
      font-weight: 700;
      font-size: 14px;
    }

    .recipe-item__meta {
      font-size: 12px;
      opacity: .65;
      margin-top: 3px;
      display: flex;
      gap: 6px;
    }

    .recipe-item__kcal {
      font-size: 18px;
      font-weight: 800;
      text-align: right;
      line-height: 1.2;
      flex-shrink: 0;
      color: #1976d2;
    }

    .dot { opacity: .4; }
  `],
})
export class AssignMealDialogComponent implements OnInit {
  private recipeService = inject(RecipeService);

  query    = '';
  loading  = true;
  recipes: RecipeRow[] = [];
  selected: RecipeRow | null = null;

  constructor(
    private dialogRef: MatDialogRef<AssignMealDialogComponent, RecipeRow>,
    @Inject(MAT_DIALOG_DATA) public data: AssignMealData,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const category = SLOT_TO_CATEGORY[this.data.slot] ?? this.data.slot.toLowerCase();
      this.recipes = await this.recipeService.getByCategory(category);
    } catch {
      this.recipes = [];
    } finally {
      this.loading = false;
    }
  }

  get filtered(): RecipeRow[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.recipes;
    return this.recipes.filter(r => r.name.toLowerCase().includes(q));
  }

  select(r: RecipeRow): void {
    this.selected = this.selected?.id === r.id ? null : r;
  }

  confirm(): void {
    if (!this.selected) return;
    this.dialogRef.close(this.selected);
  }
}
