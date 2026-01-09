// src/app/pages/recipes/recipes.page.ts
import { Component } from '@angular/core';
import { CardPreviewComponent } from '../../components/cardInfo/card-preview.component';

@Component({
  selector: 'app-recipes-page',
  standalone: true,
  imports: [CardPreviewComponent],
  template: `
    <div class="cards-grid">
   </div>
  `,
})
export class RecipesPage {}
