import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export type PatientNote = {
  id: string;
  patient_id: string;
  note_text: string;
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class PatientNotesService {

  async getByPatient(patientId: string): Promise<PatientNote[]> {
    const { data, error } = await supabase
      .from('patient_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async add(patientId: string, text: string): Promise<PatientNote> {
    const { data, error } = await supabase
      .from('patient_notes')
      .insert({ patient_id: patientId, note_text: text.trim() })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('patient_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }
}
