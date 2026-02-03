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

  searchQuery = '';
  selectedCategory = 'Todas';

  // ✅ puedes hardcodear o generarlas desde tags
  categories: string[] = ['Todas'];

  constructor(private recipesService: RecipesService) {
    this.recetas = this.recipesService.getAll();

    // opcional: si quieres categorías dinámicas desde tags:
    // this.categories = this.buildCategories(this.recetas);
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  get filteredRecipes(): Recipe[] {
    const q = this.searchQuery.trim().toLowerCase();
    const cat = this.selectedCategory;

    return this.recetas.filter((r) => {
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
       r.description.toLowerCase().includes(q);

      const matchesCategory = cat === 'Todas' || r.tags === cat;

      return matchesSearch && matchesCategory;
    });
  }

  
}
