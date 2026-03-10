import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type PatientInsert = {
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  edad?: number;
  genero?: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
  estado?: 'Activo' | 'Inactivo';
  notas?: string;
};

@Injectable({ providedIn: 'root' })
export class PatientsSupabaseService {
  async create(patient: PatientInsert) {
    // ✅ PRUEBA NUCLEAR
    const sessionRes = await supabase.auth.getSession();
    console.log('SESSION:', sessionRes.data.session);

    if (!sessionRes.data.session) {
      throw new Error('Auth Session Missing: no hay sesión activa. Debes iniciar sesión en Supabase Auth.');
    }

    const user = sessionRes.data.session.user;

    // ✅ INSERT
    const { data, error } = await supabase
      .from('patients')
      .insert({
        nutritionist_id: user.id,
        ...patient,
        estado: patient.estado ?? 'Activo',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}