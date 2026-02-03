import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipesService, Recipe } from '../../data/recipes.service';

type RecipeUI = Recipe & {
  rating?: number;
  reviews?: number;
  calories?: number;
  servings?: number;
  tags?: string[];          // chips
  ingredients?: string[];   // lista
  instructions?: string[];  // pasos
  description?: string[];  // pasos
};

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./recipe-detail.component.css'],
  template: `
  <section class="detail-page" *ngIf="recipe">
    
  <div class="detail-shell">

    <a class="back" routerLink="/recetas">← Volver</a>

    <!-- HERO -->
    <div class="hero">
      <img [src]="recipe.image" [alt]="recipe.title" />

      <div class="hero-badges">
        <span class="badge">⭐ {{ recipe.rating ?? 4.8 }}</span>
        <span class="badge">{{ recipe.reviews ?? 234 }} reseñas</span>
      </div>
    </div>

    <!-- HEADER -->
    <div class="head">
      <h1>{{ recipe.title }}</h1>

      <div class="chips">
        <span class="chip" *ngFor="let t of recipe.tags ?? []">{{ t }}</span>
      </div>

      <div class="meta">
        <span>⏱ {{ recipe.duration }}</span>
        <span>🍽 {{ recipe.servings ?? 4 }} porciones</span>
        <span>🔥 {{ recipe.calories ?? 520 }} kcal</span>
        <span class="difficulty">{{ recipe.tags }}</span>
      </div>
    </div>

    <!-- CONTENT -->
  <!-- CONTENT -->
<div class="content">
  <!-- LEFT -->
  <section class="panel">
    <h3 class="panel__title">Descripción</h3>
    <p class="desc">
      {{ recipe.description || 'Sin descripción disponible.' }}
    </p>

    <h3 class="panel__title">Ingredientes</h3>

    <ul class="list" *ngIf="(recipe.ingredients?.length ?? 0) > 0; else noIngredients">
      <li *ngFor="let ing of recipe.ingredients">
        {{ ing }}
      </li>
    </ul>

    <ng-template #noIngredients>
      <p class="desc">Ingredientes no especificados.</p>
    </ng-template>
  </section>

  <!-- RIGHT -->
  <section class="panel">
    <h3 class="panel__title">Instrucciones</h3>

    <ol class="steps" *ngIf="(recipe.instructions?.length ?? 0) > 0; else noSteps">
      <li class="step" *ngFor="let step of recipe.instructions; let i = index">
        <span class="step__num">{{ i + 1 }}</span>
        <p class="step__text">{{ step }}</p>
      </li>
    </ol>

    <ng-template #noSteps>
      <p class="desc">Instrucciones no disponibles.</p>
    </ng-template>
  </section>
</div>


<section class="detail-page" *ngIf="!recipe">
  <div class="detail-shell">
    <a class="back" routerLink="/recetas">← Volver</a>
    <h2>Receta no encontrada</h2>
    <p>El id de la receta no existe.</p>
  </div>
</section>

  `
  
})
export class RecipeDetailComponent {
  recipe?: RecipeUI;

 constructor(route: ActivatedRoute, recipesService: RecipesService) {
  route.paramMap.subscribe(params => {
    const id = (params.get('id') ?? '').trim();

    const r = recipesService.getById(id) as any;
    if (!r) {
      this.recipe = undefined;
      return;
    }

    // ✅ normalizar a arrays SIEMPRE
    const tagsArr = Array.isArray(r.tags)
      ? r.tags
      : (typeof r.tags === 'string' && r.tags.trim() ? [r.tags.trim()] : []);

    const instrArr = Array.isArray(r.instructions)
      ? r.instructions
      : (typeof r.instructions === 'string' && r.instructions.trim()
          ? [r.instructions.trim()]
          : []);

    const ingArr = Array.isArray(r.ingredients)
      ? r.ingredients
      : (typeof r.ingredients === 'string' && r.ingredients.trim()
          ? [r.ingredients.trim()]
          : []);

    this.recipe = {
      ...r,
      tags: tagsArr,
      instructions: instrArr,
      ingredients: ingArr,
    } as RecipeUI;
  });
}

  // Helpers para pintar dificultad
  isEasy(d: string){ return /f[aá]cil/i.test(d); }       // Fácil / Muy fácil
  isMid(d: string){ return /medio/i.test(d); }          // Medio
  isHard(d: string){ return /dif[ií]cil/i.test(d); }    // Difícil
}
