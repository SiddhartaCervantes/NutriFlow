-- ============================================================
-- NutriFlow — Tabla recipes + seed de 30 recetas
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text        NOT NULL,
  description  text,
  category     text        NOT NULL CHECK (category IN ('desayuno', 'comida', 'cena')),
  calories     integer     NOT NULL,
  protein_g    decimal(5,1) NOT NULL,
  carbs_g      decimal(5,1) NOT NULL,
  fat_g        decimal(5,1) NOT NULL,
  prep_time_min integer    DEFAULT 20,
  difficulty   text        DEFAULT 'Fácil',
  instructions text,
  image_url    text,
  created_at   timestamptz DEFAULT now()
);

-- Row Level Security: solo usuarios autenticados pueden leer
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read recipes" ON public.recipes;
CREATE POLICY "Authenticated users can read recipes"
  ON public.recipes FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- SEED: 30 recetas (10 desayunos · 10 comidas · 10 cenas)
-- Rango calórico diseñado para cubrir objetivos de 1400-2800 kcal/día
-- ============================================================

INSERT INTO public.recipes
  (name, description, category, calories, protein_g, carbs_g, fat_g, prep_time_min, difficulty, instructions)
VALUES

-- ── DESAYUNOS ────────────────────────────────────────────────────────────
('Yogurt con frutas frescas',
 'Yogurt natural bajo en grasa con fresas y arándanos frescos.',
 'desayuno', 220, 12.0, 32.0, 4.5, 5, 'Muy fácil',
 'Sirve el yogurt en un tazón. Agrega las frutas lavadas y cortadas encima. Opcional: añade miel.'),

('Avena con leche y canela',
 'Avena cocida en leche descremada con canela y miel de agave.',
 'desayuno', 310, 10.0, 54.0, 6.0, 10, 'Fácil',
 'Calienta la leche. Agrega la avena y cocina 5 min removiendo. Añade canela y endulzante.'),

('Tortillas con frijoles y queso',
 'Dos tortillas de maíz con frijoles refritos y queso fresco.',
 'desayuno', 380, 14.0, 60.0, 8.5, 15, 'Fácil',
 'Calienta las tortillas en comal. Agrega una capa de frijoles y espolvorea queso fresco.'),

('Huevos revueltos con tostadas integrales',
 'Tres huevos revueltos con pan integral tostado y aguacate.',
 'desayuno', 420, 26.0, 38.0, 16.0, 10, 'Fácil',
 'Bate los huevos con sal y pimienta. Cocina a fuego medio. Sirve con pan tostado y aguacate.'),

('Omelet de espinacas y champiñones',
 'Omelet de dos huevos relleno de espinacas, champiñones salteados y queso Oaxaca.',
 'desayuno', 380, 28.0, 8.0, 26.0, 15, 'Fácil',
 'Saltea espinacas y champiñones con ajo. Haz el omelet con los huevos y rellena.'),

('Smoothie de proteína con avena',
 'Batido con proteína en polvo sabor vainilla, avena, plátano y leche de almendra.',
 'desayuno', 450, 35.0, 52.0, 8.0, 5, 'Muy fácil',
 'Licúa todos los ingredientes con hielo hasta obtener consistencia homogénea.'),

('Pancakes de avena y plátano',
 'Pancakes sin harina hechos con avena molida, huevo y plátano maduro.',
 'desayuno', 480, 18.0, 72.0, 12.0, 20, 'Medio',
 'Muele la avena. Mezcla con huevo y plátano aplastado. Cocina porciones en sartén antiadherente.'),

('Tostadas con aguacate y huevo pochado',
 'Dos rebanadas de pan integral con aguacate machacado y huevo pochado.',
 'desayuno', 500, 22.0, 42.0, 24.0, 15, 'Medio',
 'Tuesta el pan. Aplasta el aguacate con limón y sal. Pocha el huevo en agua con vinagre.'),

('Bowl de açaí con granola y fruta',
 'Bowl de açaí congelado con leche de coco, granola casera, plátano y fresas.',
 'desayuno', 520, 8.0, 84.0, 14.0, 10, 'Muy fácil',
 'Procesa el açaí con leche de coco. Sirve en tazón y agrega granola y frutas encima.'),

('Burrito de huevo con frijoles y aguacate',
 'Tortilla de harina grande con huevos revueltos, frijoles, aguacate y pico de gallo.',
 'desayuno', 550, 28.0, 64.0, 18.0, 20, 'Medio',
 'Prepara los huevos y calienta los frijoles. Enrolla todo en la tortilla con aguacate y pico de gallo.'),

-- ── COMIDAS ──────────────────────────────────────────────────────────────
('Sopa de pollo con verduras',
 'Caldo de pollo con zanahoria, calabaza, chayote y papa, servido con tortillas.',
 'comida', 380, 30.0, 40.0, 7.5, 40, 'Fácil',
 'Cocina el pollo en agua con cebolla y ajo 20 min. Agrega verduras cortadas y cocina 15 min más.'),

('Ensalada de atún con tostadas',
 'Atún en agua mezclado con jitomate, pepino, cilantro y limón, con tostadas de maíz.',
 'comida', 420, 36.0, 34.0, 10.0, 10, 'Muy fácil',
 'Escurre el atún. Mezcla con verduras picadas. Aliña con limón, aceite de oliva y sal.'),

('Lentejas guisadas con arroz integral',
 'Lentejas en caldo con jitomate, cebolla y epazote, acompañadas de arroz integral.',
 'comida', 490, 22.0, 82.0, 5.5, 35, 'Fácil',
 'Sofríe cebolla y jitomate. Agrega lentejas con agua y cocina 30 min. Sirve con arroz.'),

('Pollo a la plancha con ensalada y tortillas',
 'Pechuga de pollo marinada a la plancha con ensalada verde y dos tortillas de maíz.',
 'comida', 520, 48.0, 30.0, 13.0, 20, 'Fácil',
 'Marina el pollo con limón, ajo y comino. Cocina a la plancha 7 min por lado.'),

('Bowl de atún con arroz integral y aguacate',
 'Atún fresco marinado en soya y ajonjolí sobre arroz integral con aguacate y pepino.',
 'comida', 560, 42.0, 64.0, 8.0, 25, 'Medio',
 'Cocina el arroz. Marina el atún con soya, limón y ajonjolí. Arma el bowl con los toppings.'),

('Pasta integral con pollo y pesto',
 'Pasta integral al dente con pechuga de pollo en cubos y salsa pesto casera.',
 'comida', 600, 40.0, 72.0, 14.0, 30, 'Medio',
 'Cocina la pasta. Dora el pollo en cubos. Prepara el pesto y mezcla todo.'),

('Salmón al horno con quinoa y brócoli',
 'Filete de salmón horneado con quinoa cocida y brócoli al vapor con limón.',
 'comida', 620, 46.0, 54.0, 18.0, 35, 'Medio',
 'Hornea el salmón a 200 °C por 15 min. Cocina la quinoa y el brócoli al vapor.'),

('Pollo al curry con arroz blanco',
 'Pechuga de pollo en salsa de curry amarillo con leche de coco y arroz blanco.',
 'comida', 660, 44.0, 74.0, 16.0, 35, 'Medio',
 'Sofríe el pollo. Agrega pasta de curry, leche de coco y cocina 15 min. Sirve con arroz.'),

('Burrito de pollo con frijoles y arroz',
 'Tortilla grande rellena de pollo, frijoles, arroz, aguacate y pico de gallo.',
 'comida', 720, 46.0, 82.0, 20.0, 25, 'Medio',
 'Prepara cada ingrediente por separado y enrolla todo en la tortilla caliente.'),

('Tacos de res con arroz rojo y frijoles',
 'Tres tacos de carne de res al pastor con guarnición de arroz rojo y frijoles de olla.',
 'comida', 780, 48.0, 88.0, 22.0, 30, 'Medio',
 'Cocina la carne con achiote y piña. Prepara el arroz rojo y los frijoles. Sirve en tortillas.'),

-- ── CENAS ────────────────────────────────────────────────────────────────
('Caldo ligero de pollo con verduras',
 'Caldo suave de pollo con zanahoria, apio y chayote, bajo en calorías.',
 'cena', 240, 24.0, 18.0, 5.5, 30, 'Fácil',
 'Cuece el pollo deshebrado en caldo de pollo bajo en sodio con verduras cortadas.'),

('Tortilla de claras con espinacas',
 'Tortilla de cinco claras de huevo con espinacas baby salteadas y orégano.',
 'cena', 280, 28.0, 6.0, 12.0, 15, 'Fácil',
 'Saltea las espinacas con ajo. Bate las claras y cocina la tortilla en sartén antiadherente.'),

('Ensalada de atún con aguacate',
 'Atún en agua con aguacate, jitomate cherry, cilantro y limón. Sin cereales.',
 'cena', 340, 32.0, 12.0, 16.0, 10, 'Muy fácil',
 'Mezcla el atún escurrido con aguacate en cubos, jitomate y cilantro. Aliña con limón.'),

('Camarones a la plancha con ensalada verde',
 'Camarones jumbo marinados con ajo y limón, a la plancha, con ensalada de lechuga mixta.',
 'cena', 360, 38.0, 10.0, 14.0, 15, 'Fácil',
 'Marina los camarones con ajo, limón y aceite. Cocina a la plancha 3 min por lado.'),

('Sopa de pollo con fideos delgados',
 'Sopa ligera de pollo con fideos número 0, zanahoria y chayote.',
 'cena', 390, 30.0, 38.0, 8.0, 25, 'Fácil',
 'Cuece el pollo en caldo. Agrega fideos y verduras picadas finamente. Cocina 10 min.'),

('Pechuga al horno con calabaza y zanahoria',
 'Pechuga de pollo horneada en su propio jugo con calabaza y zanahoria asadas.',
 'cena', 420, 44.0, 20.0, 14.0, 35, 'Fácil',
 'Marina la pechuga. Coloca en charola con verduras y hornea a 180 °C por 30 min.'),

('Bowl de quinoa con vegetales asados',
 'Quinoa cocida con pimiento morrón asado, espinacas, aguacate y aderezo de limón.',
 'cena', 430, 16.0, 62.0, 12.0, 25, 'Fácil',
 'Cocina la quinoa. Asa los pimientos en el comal. Arma el bowl con todos los ingredientes.'),

('Salmón al vapor con espárragos',
 'Filete de salmón al vapor con espárragos y rodajas de limón.',
 'cena', 460, 42.0, 8.0, 24.0, 20, 'Fácil',
 'Coloca el salmón en vaporera con limón y eneldo. Cocina 12 min. Sirve con espárragos blanqueados.'),

('Pavo al horno con camote asado',
 'Pechuga de pavo horneada con especias y camote naranja asado con canela.',
 'cena', 500, 42.0, 46.0, 12.0, 40, 'Medio',
 'Hornea el pavo y el camote por separado a 180 °C por 35 min. Sazona al gusto.'),

('Filete magro de res con brócoli al vapor',
 'Filete de res bajo en grasa a la plancha con brócoli y limón.',
 'cena', 520, 48.0, 10.0, 26.0, 20, 'Medio',
 'Cocina el filete 4 min por lado en plancha caliente. Blanquea el brócoli 4 min en agua hirviendo.');
