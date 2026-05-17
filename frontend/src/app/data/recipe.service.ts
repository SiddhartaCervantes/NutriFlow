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
  instructions: string | null;
  image_url: string | null;
};

const FIELDS = 'id, name, description, category, calories, protein_g, carbs_g, fat_g, prep_time_min, difficulty, instructions, image_url';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  async getAll(): Promise<RecipeRow[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select(FIELDS)
      .order('name');
    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string): Promise<RecipeRow | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select(FIELDS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ?? null;
  }

  async getByCategory(category: string): Promise<RecipeRow[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select(FIELDS)
      .eq('category', category.toLowerCase())
      .order('name');
    if (error) throw error;
    return data ?? [];
  }
}
