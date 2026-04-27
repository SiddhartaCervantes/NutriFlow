import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type MeasurementRow = {
  id: string;
  patient_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  measured_at: string;
  notes: string | null;
  created_at: string;
};

export type NewMeasurement = {
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  measured_at: string;
  notes: string | null;
};

@Injectable({ providedIn: 'root' })
export class MeasurementService {

  async getByPatient(patientId: string): Promise<MeasurementRow[]> {
    const { data, error } = await supabase
      .from('patient_measurements')
      .select('*')
      .eq('patient_id', patientId)
      .order('measured_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async add(patientId: string, data: NewMeasurement): Promise<MeasurementRow> {
    const { data: row, error } = await supabase
      .from('patient_measurements')
      .insert({ patient_id: patientId, ...data })
      .select('*')
      .single();

    if (error) throw error;
    return row;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patient_measurements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
