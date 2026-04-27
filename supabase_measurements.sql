-- ============================================================
-- NutriFlow — Tabla patient_measurements
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patient_measurements (
  id           uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id   uuid         NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight_kg    decimal(5,2),
  height_cm    decimal(5,1),
  bmi          decimal(4,1),
  body_fat_pct decimal(4,1),
  measured_at  date         NOT NULL DEFAULT CURRENT_DATE,
  notes        text,
  created_at   timestamptz  DEFAULT now()
);

ALTER TABLE public.patient_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read measurements"   ON public.patient_measurements;
DROP POLICY IF EXISTS "Auth users can insert measurements" ON public.patient_measurements;
DROP POLICY IF EXISTS "Auth users can delete measurements" ON public.patient_measurements;

CREATE POLICY "Auth users can read measurements"
  ON public.patient_measurements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can insert measurements"
  ON public.patient_measurements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can delete measurements"
  ON public.patient_measurements FOR DELETE TO authenticated USING (true);
