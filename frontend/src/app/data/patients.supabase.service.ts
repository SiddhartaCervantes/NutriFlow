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
  photo_url: string | null;
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
  photo_url?: string | null;
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

  async uploadPhoto(patientId: string, file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${patientId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('patient-photos')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('patient-photos')
      .getPublicUrl(path);

    const photoUrl = data.publicUrl;

    await this.update(patientId, { photo_url: photoUrl });
    return photoUrl;
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
