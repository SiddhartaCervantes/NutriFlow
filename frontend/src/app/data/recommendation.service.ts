import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type RecommendationRequest = {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  goal: string;
  activityLevel: string;
};

export type RecipeDto = {
  id: string;
  name: string;
  description: string;
  category: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  prepTimeMin: number;
  difficulty: string;
};

export type MealRecommendation = {
  slot: string;
  targetCalories: number;
  recipe: RecipeDto | null;
  calorieDeviation: number;
  calorieAccuracyPct: number;
};

export type NutritionalTargets = {
  tmb: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
};

export type RecommendationResponse = {
  targets: NutritionalTargets;
  meals: MealRecommendation[];
  summary: string;
  overallAccuracyPct: number;
  knowledgeBaseSize: number;
};

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly apiUrl = `${environment.apiUrl}/api/recomendacion/plan`;

  constructor(private http: HttpClient) {}

  generatePlan(request: RecommendationRequest): Promise<RecommendationResponse> {
    return firstValueFrom(
      this.http.post<RecommendationResponse>(this.apiUrl, request)
    );
  }
}
