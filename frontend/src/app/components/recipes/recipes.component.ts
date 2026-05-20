import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CardPreviewComponent } from '../../components/cardInfo/card-preview.component';
import { RecipeService, RecipeRow, RecipeInput } from '../../data/recipe.service';
import { PexelsService } from '../../data/pexels.service';
import { RecipeFormDialogComponent } from './recipe-form-dialog.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardPreviewComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent implements OnInit {
  recetas: RecipeRow[] = [];
  loading = true;
  error = false;

  private resolvedImages = new Map<string, string>();

  searchQuery = '';
  selectedCategory = 'Todas';
  readonly categories = ['Todas', 'Desayuno', 'Comida', 'Cena'];

  constructor(
    private recipeService: RecipeService,
    private pexels: PexelsService,
    private dialog: MatDialog,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadRecipes();
  }

  private async loadRecipes(): Promise<void> {
    this.loading = true;
    this.error = false;
    try {
      this.recetas = await this.recipeService.getAll();
      this.resolveImages();
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  private resolveImages(): void {
    for (const r of this.recetas) {
      if (!r.image_url) {
        this.pexels.getPhoto(`${r.name} food`).then(url => {
          if (url) this.resolvedImages.set(r.id, url);
        });
      }
    }
  }

  getImage(r: RecipeRow): string {
    return r.image_url ?? this.resolvedImages.get(r.id) ?? '';
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  get filteredRecipes(): RecipeRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.selectedCategory;

    return this.recetas.filter(r => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q);

      const matchesCategory =
        cat === 'Todas' || r.category.toLowerCase() === cat.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }

  formatDuration(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }

  openCreate(): void {
    this.dialog
      .open(RecipeFormDialogComponent, { data: {}, width: '560px' })
      .afterClosed()
      .subscribe(async (input: RecipeInput | null | undefined) => {
        if (!input) return;
        try {
          const created = await this.recipeService.create(input);
          this.recetas = [...this.recetas, created];
        } catch (err) {
          console.error('create recipe error', err);
          alert('No se pudo crear la receta. Intenta de nuevo.');
        }
      });
  }

  openEdit(recipe: RecipeRow, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dialog
      .open(RecipeFormDialogComponent, { data: { recipe }, width: '560px' })
      .afterClosed()
      .subscribe(async (input: RecipeInput | null | undefined) => {
        if (!input) return;
        try {
          const updated = await this.recipeService.update(recipe.id, input);
          this.recetas = this.recetas.map(r => r.id === recipe.id ? updated : r);
        } catch {
          alert('No se pudo actualizar la receta. Intenta de nuevo.');
        }
      });
  }

  async deleteRecipe(recipe: RecipeRow, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(`¿Eliminar "${recipe.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await this.recipeService.delete(recipe.id);
      this.recetas = this.recetas.filter(r => r.id !== recipe.id);
    } catch {
      alert('No se pudo eliminar la receta. Intenta de nuevo.');
    }
  }
}
