import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type PatientRow = {
  id: string;
  nutritionist_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  edad: number | null;
  genero: string | null;
  peso: number | null;
  altura: number | null;
  objetivo: string | null;
  actividad: string | null;
  estado: 'Activo' | 'Inactivo';
  notas: string | null;
  created_at: string;
};

export type PatientInsert = {
  nombre: string;
  apellido: string;
  email?: string | null;
  telefono?: string | null;
  edad?: number | null;
  genero?: string | null;
  peso?: number | null;
  altura?: number | null;
  objetivo?: string | null;
  actividad?: string | null;
  estado?: 'Activo' | 'Inactivo';
  notas?: string | null;
};

@Injectable({ providedIn: 'root' })
export class PatientsSupabaseService {

  async getAll(): Promise<PatientRow[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('nutritionist_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string): Promise<PatientRow> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async update(id: string, data: Partial<PatientInsert>): Promise<PatientRow> {
    const { data: row, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return row;
  }

  async create(patient: PatientInsert): Promise<PatientRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { data, error } = await supabase
      .from('patients')
      .insert({ nutritionist_id: user.id, ...patient, estado: patient.estado ?? 'Activo' })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
