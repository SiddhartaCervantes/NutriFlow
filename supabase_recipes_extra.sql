-- ============================================================
-- NutriFlow — 15 recetas adicionales
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

INSERT INTO public.recipes
  (name, description, category, calories, protein_g, carbs_g, fat_g, prep_time_min, difficulty, instructions)
VALUES

-- ── DESAYUNOS ────────────────────────────────────────────────────────────
('Chilaquiles con huevo estrellado',
 'Totopos en salsa verde con crema, queso fresco y un huevo estrellado encima.',
 'desayuno', 480, 22.0, 56.0, 16.0, 20, 'Medio',
 'Fríe los totopos ligeramente. Calienta la salsa verde y mezcla con los totopos. Sirve con huevo estrellado, crema y queso.'),

('Hotcakes integrales con miel y plátano',
 'Hotcakes de harina integral con miel de abeja y rodajas de plátano.',
 'desayuno', 390, 12.0, 68.0, 8.0, 20, 'Fácil',
 'Mezcla harina integral, huevo, leche y polvo para hornear. Cocina en sartén antiadherente. Sirve con miel y plátano.'),

('Quesadillas de frijol con queso',
 'Dos quesadillas de tortilla de maíz con frijoles refritos y queso Oaxaca.',
 'desayuno', 350, 18.0, 42.0, 12.0, 10, 'Muy fácil',
 'Calienta las tortillas en comal. Agrega frijoles y queso, dobla y calienta hasta que el queso se derrita.'),

('Licuado proteico de vainilla con leche',
 'Proteína en polvo de vainilla con leche entera, plátano y avena.',
 'desayuno', 400, 38.0, 44.0, 7.0, 5, 'Muy fácil',
 'Licúa todos los ingredientes hasta obtener consistencia cremosa. Sirve frío.'),

('Bowl de fruta con granola y miel',
 'Mezcla de papaya, mango y piña con granola artesanal y miel de agave.',
 'desayuno', 300, 6.0, 62.0, 5.0, 5, 'Muy fácil',
 'Corta la fruta en cubos. Sirve en tazón y agrega granola y miel encima.'),

-- ── COMIDAS ──────────────────────────────────────────────────────────────
('Enchiladas verdes con pollo',
 'Tres enchiladas de pollo deshebrado en salsa verde con crema y queso.',
 'comida', 620, 38.0, 58.0, 22.0, 30, 'Medio',
 'Deshebra el pollo cocido. Pasa las tortillas por salsa verde. Rellena con pollo, enrolla y baña con más salsa. Agrega crema y queso.'),

('Pozole rojo de pollo',
 'Caldo rojo de chile guajillo con pollo deshebrado y maíz cacahuazintle.',
 'comida', 500, 36.0, 54.0, 10.0, 50, 'Medio',
 'Tuesta los chiles, hidrata y licúa. Cuece el pollo y deshebra. Agrega maíz y caldo al chile licuado. Cocina 20 min.'),

('Arroz con camarones al ajillo',
 'Arroz blanco con camarones salteados en mantequilla, ajo y chile de árbol.',
 'comida', 550, 32.0, 68.0, 12.0, 25, 'Medio',
 'Cocina el arroz. Saltea ajo y chile en mantequilla, agrega camarones 3 min. Mezcla con el arroz y sirve.'),

('Milanesa de pollo con puré de papa',
 'Pechuga empanizada al horno con puré de papa y ensalada de lechuga.',
 'comida', 680, 44.0, 64.0, 20.0, 35, 'Medio',
 'Empaniza el pollo con pan molido y hornea a 200 °C por 20 min. Prepara el puré con papa cocida, mantequilla y leche.'),

('Tostadas de tinga de pollo',
 'Tres tostadas con tinga de pollo en chipotle, crema y queso fresco.',
 'comida', 580, 36.0, 52.0, 18.0, 30, 'Fácil',
 'Cuece el pollo y deshebra. Sofríe cebolla y jitomate, agrega chipotle y el pollo. Sirve sobre tostadas con crema y queso.'),

-- ── CENAS ────────────────────────────────────────────────────────────────
('Sopa de verduras con pechuga',
 'Caldo ligero de jitomate con calabaza, ejotes, zanahoria y pechuga en cubos.',
 'cena', 320, 28.0, 26.0, 7.0, 30, 'Fácil',
 'Sofríe jitomate y cebolla. Agrega caldo, verduras y pollo en cubos. Cocina 20 min a fuego medio.'),

('Quesadillas de espinacas con requesón',
 'Dos quesadillas de harina con espinacas salteadas, requesón y chile poblano.',
 'cena', 380, 22.0, 40.0, 14.0, 15, 'Fácil',
 'Saltea espinacas con ajo. Mezcla con requesón. Rellena las tortillas, añade chile poblano en rajas y calienta en comal.'),

('Ensalada César con pollo a la plancha',
 'Lechuga romana con aderezo César ligero, crutones integrales y pechuga de pollo.',
 'cena', 400, 36.0, 22.0, 18.0, 15, 'Fácil',
 'Cocina el pollo a la plancha con sal y pimienta. Mezcla lechuga con aderezo. Agrega pollo en rebanadas y crutones.'),

('Tacos de pescado a la plancha',
 'Dos tacos de filete de tilapia a la plancha con repollo, pico de gallo y limón.',
 'cena', 440, 38.0, 36.0, 10.0, 20, 'Fácil',
 'Sazona el pescado con ajo, limón y comino. Cocina a la plancha 4 min por lado. Sirve en tortillas con repollo y pico de gallo.'),

('Crema de zanahoria con tiras de pechuga',
 'Crema suave de zanahoria con jengibre y cúrcuma, con tiras de pollo a la plancha.',
 'cena', 350, 30.0, 32.0, 8.0, 30, 'Fácil',
 'Cuece zanahorias con cebolla y jengibre. Licúa con caldo de pollo y cúrcuma. Cocina las tiras de pollo y sirve sobre la crema.');
