import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipesService, Recipe } from '../../data/recipes.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="detail" *ngIf="recipe; else notFound">
      <a class="back" routerLink="/recipes">← Volver</a>

      <div class="hero">
        <img [src]="recipe.image" [alt]="recipe.title" />
        <div class="info">
          <h1>{{ recipe.title }}</h1>
          <p>{{ recipe.description }}</p>

          <div class="meta">
            <span>⏱ {{ recipe.duration }}</span>
            <span>⭐ {{ recipe.difficulty }}</span>
          </div>
        </div>
      </div>
    </section>

    <ng-template #notFound>
      <section class="detail">
        <a class="back" routerLink="/recipes">← Volver</a>
        <h2>Receta no encontrada</h2>
        <p>El id de la receta no existe.</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .detail { padding: 24px; }
    .back { display:inline-block; margin-bottom: 12px; text-decoration:none; color: inherit; }
    .hero { display:flex; gap: 18px; align-items: start; }
    img { width: 320px; height: 200px; object-fit: cover; border-radius: 16px; }
    .meta { display:flex; gap: 12px; margin-top: 10px; opacity: .8; }
    @media (max-width: 900px) { .hero { flex-direction: column; } img { width: 100%; } }
  `]
})
export class RecipeDetailComponent {
  recipe?: Recipe;

  constructor(route: ActivatedRoute, recipesService: RecipesService) {
    route.paramMap.subscribe(params => {
      const id = params.get('id') ?? '';
      this.recipe = recipesService.getById(id);
    });
  }
}
