import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type RecipeRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prep_time_min: number;
  difficulty: string | null;
};

@Injectable({ providedIn: 'root' })
export class RecipeService {
  async getByCategory(category: string): Promise<RecipeRow[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, description, category, calories, protein_g, carbs_g, fat_g, prep_time_min, difficulty')
      .eq('category', category.toLowerCase())
      .order('name');

    if (error) throw error;
    return data ?? [];
  }
}
