import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type AppointmentRow = {
  id: string;
  patient_id: string;
  patient_name: string;
  date_time: string;
  mode: 'Online' | 'Presencial';
  note: string | null;
  created_at: string;
};

export type NewAppointment = Omit<AppointmentRow, 'id' | 'created_at'>;

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  async getAll(): Promise<AppointmentRow[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date_time', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getByPatient(patientId: string): Promise<AppointmentRow[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date_time', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getUpcoming(patientId: string): Promise<AppointmentRow[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(5);

    if (error) throw error;
    return data ?? [];
  }

  async add(data: NewAppointment): Promise<AppointmentRow> {
    const { data: row, error } = await supabase
      .from('appointments')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;
    return row;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
