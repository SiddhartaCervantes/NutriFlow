import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { MealRecommendation, NutritionalTargets } from './recommendation.service';
import { RecipeRow } from './recipe.service';

export interface SaveSingleMealOptions {
  patientId:    string;
  dayOfWeek:    string;
  displayOrder: string;
  slot:         string;
  recipe:       RecipeRow;
}

export interface DietMealRow {
  meal_type: string;
  meal_name: string;
  calories: number;
  protein: number;
}

export interface DietDayRow {
  day_of_week: string;
  meals: DietMealRow[];
}

export interface LoadedPlan {
  planId: number;
  title: string;
  days: DietDayRow[];
}

export interface SavePlanOptions {
  patientId: string;
  title: string;
  dayOfWeek: string;
  displayOrder: string;
  goal: string;
  targets: NutritionalTargets;
  meals: MealRecommendation[];
}

@Injectable({ providedIn: 'root' })
export class DietPlanService {

  async loadPlan(patientId: string): Promise<LoadedPlan | null> {
    const { data: plan } = await supabase
      .from('diet_plans')
      .select('id, title')
      .eq('patient_id', patientId)
      .eq('isActive', true)
      .limit(1)
      .single();

    if (!plan) return null;

    const { data: days } = await supabase
      .from('diet_plan_days')
      .select('day_of_week, diet_plan_meals(meal_type, meal_name, calories, protein)')
      .eq('diet_plan_id', plan.id);

    return {
      planId: plan.id,
      title:  plan.title ?? '',
      days: (days ?? []).map((d: any) => ({
        day_of_week: d.day_of_week,
        meals:       d.diet_plan_meals ?? [],
      })),
    };
  }

  async savePlan(opts: SavePlanOptions): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No hay sesión activa. Inicia sesión e intenta de nuevo.');

    // 1. Buscar plan activo existente para este paciente
    let planId: number;
    const { data: existingPlan } = await supabase
      .from('diet_plans')
      .select('id')
      .eq('patient_id', opts.patientId)
      .eq('isActive', true)
      .limit(1)
      .single();

    if (existingPlan) {
      // Actualizar título y macros del plan existente
      await supabase
        .from('diet_plans')
        .update({
          title:          opts.title,
          objective:      opts.goal,
          daily_calories: Math.round(opts.targets.dailyCalorieTarget),
          daily_protein:  Math.round(opts.targets.proteinTargetG),
          daily_carbs:    Math.round(opts.targets.carbsTargetG),
          daily_fats:     Math.round(opts.targets.fatTargetG),
        })
        .eq('id', existingPlan.id);
      planId = existingPlan.id;
    } else {
      // Crear plan nuevo
      const { data: newPlan, error: planError } = await supabase
        .from('diet_plans')
        .insert({
          patient_id:      opts.patientId,
          nutritionist_id: user.id,
          title:           opts.title,
          objective:       opts.goal,
          daily_calories:  Math.round(opts.targets.dailyCalorieTarget),
          daily_protein:   Math.round(opts.targets.proteinTargetG),
          daily_carbs:     Math.round(opts.targets.carbsTargetG),
          daily_fats:      Math.round(opts.targets.fatTargetG),
          start_date:      new Date().toISOString().split('T')[0],
          isActive:        true,
        })
        .select('id')
        .single();
      if (planError || !newPlan) throw new Error('Error al crear el plan: ' + planError?.message);
      planId = newPlan.id;
    }

    // 2. Buscar si ya existe el día dentro del plan
    let dayId: number;
    const { data: existingDay } = await supabase
      .from('diet_plan_days')
      .select('id')
      .eq('diet_plan_id', planId)
      .eq('day_of_week', opts.dayOfWeek)
      .limit(1)
      .single();

    if (existingDay) {
      // Borrar comidas anteriores de ese día
      await supabase
        .from('diet_plan_meals')
        .delete()
        .eq('diet_plan_day_id', existingDay.id);
      dayId = existingDay.id;
    } else {
      // Crear día nuevo
      const { data: newDay, error: dayError } = await supabase
        .from('diet_plan_days')
        .insert({
          diet_plan_id:  planId,
          day_of_week:   opts.dayOfWeek,
          display_order: opts.displayOrder,
        })
        .select('id')
        .single();
      if (dayError || !newDay) throw new Error('Error al crear el día: ' + dayError?.message);
      dayId = newDay.id;
    }

    // 3. Insertar comidas nuevas
    const mealsToInsert = opts.meals
      .filter(m => m.recipe !== null)
      .map(m => ({
        diet_plan_day_id: dayId,
        meal_type:        m.slot.toLowerCase(),
        meal_name:        m.recipe!.name,
        recipe_id:        m.recipe!.id,
        calories:         m.recipe!.calories,
        protein:          Math.round(Number(m.recipe!.proteinG)),
        carbs:            Math.round(Number(m.recipe!.carbsG)),
        fats:             Math.round(Number(m.recipe!.fatG)),
      }));

    const { error: mealsError } = await supabase
      .from('diet_plan_meals')
      .insert(mealsToInsert);
    if (mealsError) throw new Error('Error al guardar las comidas: ' + mealsError.message);
  }

  async saveSingleMeal(opts: SaveSingleMealOptions): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No hay sesión activa.');

    // 1. Obtener o crear plan activo
    let planId: number;
    const { data: existingPlan } = await supabase
      .from('diet_plans')
      .select('id')
      .eq('patient_id', opts.patientId)
      .eq('isActive', true)
      .limit(1)
      .single();

    if (existingPlan) {
      planId = existingPlan.id;
    } else {
      const { data: newPlan, error } = await supabase
        .from('diet_plans')
        .insert({
          patient_id:      opts.patientId,
          nutritionist_id: user.id,
          title:           'Plan manual',
          objective:       '',
          daily_calories:  0,
          daily_protein:   0,
          daily_carbs:     0,
          daily_fats:      0,
          start_date:      new Date().toISOString().split('T')[0],
          isActive:        true,
        })
        .select('id')
        .single();
      if (error || !newPlan) throw new Error('Error al crear el plan.');
      planId = newPlan.id;
    }

    // 2. Obtener o crear el día
    let dayId: number;
    const { data: existingDay } = await supabase
      .from('diet_plan_days')
      .select('id')
      .eq('diet_plan_id', planId)
      .eq('day_of_week', opts.dayOfWeek)
      .limit(1)
      .single();

    if (existingDay) {
      dayId = existingDay.id;
    } else {
      const { data: newDay, error } = await supabase
        .from('diet_plan_days')
        .insert({
          diet_plan_id:  planId,
          day_of_week:   opts.dayOfWeek,
          display_order: opts.displayOrder,
        })
        .select('id')
        .single();
      if (error || !newDay) throw new Error('Error al crear el día.');
      dayId = newDay.id;
    }

    // 3. Reemplazar comida del slot
    await supabase
      .from('diet_plan_meals')
      .delete()
      .eq('diet_plan_day_id', dayId)
      .eq('meal_type', opts.slot.toLowerCase());

    const { error: mealError } = await supabase
      .from('diet_plan_meals')
      .insert({
        diet_plan_day_id: dayId,
        meal_type:        opts.slot.toLowerCase(),
        meal_name:        opts.recipe.name,
        recipe_id:        opts.recipe.id,
        calories:         opts.recipe.calories,
        protein:          Math.round(Number(opts.recipe.protein_g)),
        carbs:            Math.round(Number(opts.recipe.carbs_g)),
        fats:             Math.round(Number(opts.recipe.fat_g)),
      });
    if (mealError) throw new Error('Error al guardar la comida: ' + mealError.message);
  }
}
