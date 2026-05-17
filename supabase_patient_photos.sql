-- 1. Agregar columna photo_url a la tabla patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Crear el bucket de almacenamiento (ejecutar en Supabase Dashboard > Storage > New bucket)
-- Nombre: patient-photos | Public: true
-- O ejecutar directamente si tienes permisos de service_role:
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Storage RLS
-- Lectura pública (para mostrar las fotos con URL directa)
CREATE POLICY "Fotos de pacientes - lectura pública"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-photos');

-- Subida solo para usuarios autenticados
CREATE POLICY "Fotos de pacientes - subida autenticada"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-photos');

-- Actualización solo para usuarios autenticados
CREATE POLICY "Fotos de pacientes - actualización autenticada"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-photos');
