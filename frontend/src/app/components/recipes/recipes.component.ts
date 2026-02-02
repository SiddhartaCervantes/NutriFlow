import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardPreviewComponent } from '../../components/cardInfo/card-preview.component';
import { RecipesService, Recipe } from '../../data/recipes.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, CardPreviewComponent],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent {
  recetas: Recipe[] = [];

  // ✅ equivalente a useState
  searchQuery = '';
  selectedCategory = 'Todas';

  // ✅ puedes hardcodear o generarlas desde tags
  categories: string[] = [
    'Todas',
    'Española',
    'Mexicana',
    'Italiana',
    'Japonesa',
    'Peruana',
    'Tailandesa',
  ];

  constructor(private recipesService: RecipesService) {
    this.recetas = this.recipesService.getAll();

    // opcional: si quieres categorías dinámicas desde tags:
    // this.categories = this.buildCategories(this.recetas);
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  // ✅ equivalente a filteredRecipes en React
  get filteredRecipes(): Recipe[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.selectedCategory;

    return this.recetas.filter((recipe) => {
      const matchesSearch =
        !q ||
        recipe.title.toLowerCase().includes(q) ||
        (recipe.tags ?? []).some((tag) => tag.toLowerCase().includes(q));

      const matchesCategory =
        cat === 'Todas' || (recipe.tags ?? []).includes(cat);

      return matchesSearch && matchesCategory;
    });
  }

  // Si quieres categorías dinámicas (opcional)
  private buildCategories(recipes: Recipe[]): string[] {
    const set = new Set<string>();
    recipes.forEach(r => (r.tags ?? []).forEach(t => set.add(t)));
    return ['Todas', ...Array.from(set).sort()];
  }
}
