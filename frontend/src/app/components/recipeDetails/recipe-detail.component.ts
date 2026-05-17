import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipeService, RecipeRow } from '../../data/recipe.service';
import { PexelsService } from '../../data/pexels.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./recipe-detail.component.css'],
  template: `
  @if (loading) {
    <section class="detail-page">
      <div class="detail-shell">
        <a class="back" routerLink="/recetas">← Volver</a>
        <p class="desc">Cargando receta...</p>
      </div>
    </section>
  }

  @if (!loading && !recipe) {
    <section class="detail-page">
      <div class="detail-shell">
        <a class="back" routerLink="/recetas">← Volver</a>
        <h2>Receta no encontrada</h2>
        <p>El id de la receta no existe.</p>
      </div>
    </section>
  }

  @if (!loading && recipe) {
    <section class="detail-page">
      <div class="detail-shell">
        <a class="back" routerLink="/recetas">← Volver</a>

        <!-- HERO -->
        <div class="hero">
          <img [src]="heroImage || 'assets/placeholder.png'" [alt]="recipe.name" />
        </div>

        <!-- HEADER -->
        <div class="head">
          <h1>{{ recipe.name }}</h1>

          <div class="chips">
            @if (recipe.difficulty) {
              <span class="chip">{{ recipe.difficulty }}</span>
            }
            <span class="chip">{{ recipe.category | titlecase }}</span>
          </div>

          <div class="meta">
            <span>⏱ {{ formatDuration(recipe.prep_time_min) }}</span>
            <span>🔥 {{ recipe.calories }} kcal</span>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="content">
          <!-- LEFT: descripción + nutrición -->
          <section class="panel">
            <h3 class="panel__title">Descripción</h3>
            <p class="desc">{{ recipe.description || 'Sin descripción disponible.' }}</p>

            <h3 class="panel__title">Información nutricional</h3>
            <ul class="list">
              <li>Proteínas: {{ recipe.protein_g }} g</li>
              <li>Carbohidratos: {{ recipe.carbs_g }} g</li>
              <li>Grasas: {{ recipe.fat_g }} g</li>
              <li>Calorías: {{ recipe.calories }} kcal</li>
            </ul>
          </section>

          <!-- RIGHT: instrucciones -->
          <section class="panel">
            <h3 class="panel__title">Instrucciones</h3>

            @if (steps.length > 0) {
              <ol class="steps">
                @for (step of steps; track $index) {
                  <li class="step">
                    <span class="step__num">{{ $index + 1 }}</span>
                    <p class="step__text">{{ step }}</p>
                  </li>
                }
              </ol>
            } @else {
              <p class="desc">Instrucciones no disponibles.</p>
            }
          </section>
        </div>
      </div>
    </section>
  }
  `
})
export class RecipeDetailComponent implements OnInit {
  recipe: RecipeRow | null = null;
  loading = true;
  steps: string[] = [];
  heroImage = '';

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private pexels: PexelsService,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    try {
      this.recipe = await this.recipeService.getById(id);
      this.steps = this.parseSteps(this.recipe?.instructions ?? null);
      if (this.recipe) {
        this.heroImage = this.recipe.image_url
          ?? await this.pexels.getPhoto(`${this.recipe.name} food`);
      }
    } catch {
      this.recipe = null;
    } finally {
      this.loading = false;
    }
  }

  formatDuration(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }

  private parseSteps(instructions: string | null): string[] {
    if (!instructions) return [];
    return instructions
      .split('\n')
      .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(s => s.length > 0);
  }
}
