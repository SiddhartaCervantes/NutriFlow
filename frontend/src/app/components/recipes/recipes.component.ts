import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardPreviewComponent } from '../../components/cardInfo/card-preview.component';
import { RecipeService, RecipeRow } from '../../data/recipe.service';
import { PexelsService } from '../../data/pexels.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, CardPreviewComponent],
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
  ) {}

  async ngOnInit(): Promise<void> {
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
}
