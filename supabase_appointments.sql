-- ============================================================
-- NutriFlow — Tabla appointments
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id       uuid        NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name     text        NOT NULL,
  date_time        timestamptz NOT NULL,
  mode             text        NOT NULL DEFAULT 'Presencial'
                               CHECK (mode IN ('Online', 'Presencial')),
  note             text,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read appointments"   ON public.appointments;
DROP POLICY IF EXISTS "Auth users can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Auth users can delete appointments" ON public.appointments;

CREATE POLICY "Auth users can read appointments"
  ON public.appointments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can insert appointments"
  ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can delete appointments"
  ON public.appointments FOR DELETE TO authenticated USING (true);
