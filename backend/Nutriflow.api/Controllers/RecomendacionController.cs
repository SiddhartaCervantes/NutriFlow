using Microsoft.AspNetCore.Mvc;
using NutriFlow.Api.Models;

namespace NutriFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecomendacionController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public RecomendacionController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        /// <summary>
        /// Genera un plan nutricional diario usando el modelo de Harris-Benedict
        /// y un árbol de decisión basado en el objetivo del paciente.
        /// </summary>
        [HttpPost("plan")]
        public async Task<IActionResult> GenerarPlan([FromBody] RecommendationRequest request)
        {
            if (request.WeightKg <= 0 || request.HeightCm <= 0 || request.Age <= 0)
                return BadRequest("Peso, altura y edad deben ser mayores a cero.");

            // ── Paso 1: Tasa Metabólica Basal (Harris-Benedict revisado, 1990) ────────
            // Hombre: TMB = 88.362 + (13.397 × kg) + (4.799 × cm) − (5.677 × años)
            // Mujer:  TMB = 447.593 + (9.247 × kg)  + (3.098 × cm) − (4.330 × años)
            double tmb = request.Gender.ToLower() == "masculino"
                ? 88.362  + (13.397 * (double)request.WeightKg) + (4.799 * (double)request.HeightCm) - (5.677 * request.Age)
                : 447.593 + (9.247  * (double)request.WeightKg) + (3.098 * (double)request.HeightCm) - (4.330 * request.Age);

            // ── Paso 2: Gasto Energético Total (TDEE = TMB × factor de actividad) ─────
            double activityFactor = request.ActivityLevel switch
            {
                "Ligero"     => 1.375,
                "Moderado"   => 1.550,
                "Activo"     => 1.725,
                "Muy activo" => 1.900,
                _            => 1.200  // Sedentario
            };
            double tdee = tmb * activityFactor;

            // ── Paso 3: Árbol de decisión — ajuste calórico según objetivo ─────────────
            double caloricTarget = request.Goal switch
            {
                "Pérdida de grasa"   => tdee - 400,
                "Ganancia muscular"  => tdee + 400,
                _                    => tdee   // Mantenimiento
            };

            // ── Paso 4: Distribución de macronutrientes ──────────────────────────────
            // Proteína: función del peso corporal según objetivo
            double proteinTarget = request.Goal switch
            {
                "Pérdida de grasa"  => (double)request.WeightKg * 2.0,
                "Ganancia muscular" => (double)request.WeightKg * 2.2,
                _                   => (double)request.WeightKg * 1.6
            };
            double fatTarget   = (caloricTarget * 0.25) / 9;   // 25 % de calorías en grasa
            double carbTarget  = (caloricTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4;

            // ── Paso 5: Distribución calórica por tiempo de comida ───────────────────
            int breakfastTarget = (int)(caloricTarget * 0.25);
            int lunchTarget     = (int)(caloricTarget * 0.40);
            int dinnerTarget    = (int)(caloricTarget * 0.35);

            // ── Paso 6: Consultar recetas en Supabase y seleccionar el mejor match ───
            var allRecipes = await _supabase.From<Recipe>().Get();

            Recipe? BestMatch(string category, int targetCals)
            {
                var candidates = allRecipes.Models
                    .Where(r => r.Category == category)
                    .OrderBy(r => Math.Abs(r.Calories - targetCals))
                    .Take(5)
                    .ToList();

                return candidates.Count == 0
                    ? null
                    : candidates[Random.Shared.Next(candidates.Count)];
            }

            static RecipeDto? ToDto(Recipe? r) => r is null ? null : new RecipeDto
            {
                Id          = r.Id.ToString(),
                Name        = r.Name,
                Description = r.Description,
                Category    = r.Category,
                Calories    = r.Calories,
                ProteinG    = r.ProteinG,
                CarbsG      = r.CarbsG,
                FatG        = r.FatG,
                PrepTimeMin = r.PrepTimeMin,
                Difficulty  = r.Difficulty,
            };

            var breakfast = ToDto(BestMatch("desayuno", breakfastTarget));
            var lunch     = ToDto(BestMatch("comida",   lunchTarget));
            var dinner    = ToDto(BestMatch("cena",     dinnerTarget));

            static MealRecommendation BuildMeal(string slot, int target, RecipeDto? recipe)
            {
                int deviation       = recipe is null ? 0 : Math.Abs(recipe.Calories - target);
                double accuracyPct  = recipe is null ? 0 : Math.Round(100.0 - (deviation / (double)target * 100.0), 1);
                return new MealRecommendation
                {
                    Slot               = slot,
                    TargetCalories     = target,
                    Recipe             = recipe,
                    CalorieDeviation   = deviation,
                    CalorieAccuracyPct = accuracyPct
                };
            }

            var meals = new List<MealRecommendation>
            {
                BuildMeal("Desayuno", breakfastTarget, breakfast),
                BuildMeal("Comida",   lunchTarget,     lunch),
                BuildMeal("Cena",     dinnerTarget,    dinner),
            };

            var mealsWithRecipe   = meals.Where(m => m.Recipe is not null).ToList();
            double overallAccuracy = mealsWithRecipe.Count == 0
                ? 0
                : Math.Round(mealsWithRecipe.Average(m => m.CalorieAccuracyPct), 1);

            var response = new RecommendationResponse
            {
                Targets = new NutritionalTargets
                {
                    Tmb                = Math.Round(tmb,           1),
                    Tdee               = Math.Round(tdee,          1),
                    DailyCalorieTarget = Math.Round(caloricTarget, 1),
                    ProteinTargetG     = Math.Round(proteinTarget, 1),
                    CarbsTargetG       = Math.Round(carbTarget,    1),
                    FatTargetG         = Math.Round(fatTarget,     1)
                },
                Meals             = meals,
                KnowledgeBaseSize = allRecipes.Models.Count,
                OverallAccuracyPct = overallAccuracy,
                Summary = $"Plan de {Math.Round(caloricTarget)} kcal/día · " +
                           $"{Math.Round(proteinTarget)}g proteína · " +
                           $"{Math.Round(carbTarget)}g carbohidratos · " +
                           $"{Math.Round(fatTarget)}g grasas · " +
                           $"Objetivo: {request.Goal}"
            };

            return Ok(response);
        }

        /// <summary>
        /// Valida el modelo matemático Harris-Benedict con 5 casos de prueba canónicos.
        /// Demuestra la precisión del sistema experto sin dependencia de base de datos.
        /// </summary>
        [HttpGet("validacion")]
        public IActionResult ValidarModelo()
        {
            static double CalcTmb(double kg, double cm, int age, string gender) =>
                gender.ToLower() == "masculino"
                    ? 88.362  + (13.397 * kg) + (4.799 * cm) - (5.677 * age)
                    : 447.593 + (9.247  * kg) + (3.098 * cm) - (4.330 * age);

            static double CalcTdee(double tmb, string activity) => tmb * (activity switch
            {
                "Ligero"     => 1.375,
                "Moderado"   => 1.550,
                "Activo"     => 1.725,
                "Muy activo" => 1.900,
                _            => 1.200
            });

            static double CalcObjetivo(double tdee, string goal) => goal switch
            {
                "Pérdida de grasa"  => tdee - 400,
                "Ganancia muscular" => tdee + 400,
                _                   => tdee
            };

            static double DesvPct(double esperado, double calculado) =>
                Math.Round(Math.Abs(esperado - calculado) / esperado * 100.0, 4);

            // Valores esperados calculados analíticamente con la fórmula Harris-Benedict (1990)
            var definiciones = new[]
            {
                new { Desc = "Hombre joven, sedentario, mantenimiento",
                      Kg = 70.0, Cm = 175.0, Age = 25, Gender = "Masculino",
                      Activity = "Sedentario",  Goal = "Mantenimiento",
                      TmbEsp = 1724.1, TdeeEsp = 2068.9, ObjEsp = 2068.9 },

                new { Desc = "Mujer adulta, moderada, pérdida de grasa",
                      Kg = 60.0, Cm = 165.0, Age = 30, Gender = "Femenino",
                      Activity = "Moderado",    Goal = "Pérdida de grasa",
                      TmbEsp = 1383.7, TdeeEsp = 2144.7, ObjEsp = 1744.7 },

                new { Desc = "Hombre, activo, ganancia muscular",
                      Kg = 85.0, Cm = 180.0, Age = 35, Gender = "Masculino",
                      Activity = "Activo",      Goal = "Ganancia muscular",
                      TmbEsp = 1892.2, TdeeEsp = 3264.0, ObjEsp = 3664.0 },

                new { Desc = "Mujer joven, ligera, mantenimiento",
                      Kg = 55.0, Cm = 160.0, Age = 22, Gender = "Femenino",
                      Activity = "Ligero",      Goal = "Mantenimiento",
                      TmbEsp = 1356.6, TdeeEsp = 1865.3, ObjEsp = 1865.3 },

                new { Desc = "Hombre mayor, muy activo, pérdida de grasa",
                      Kg = 90.0, Cm = 185.0, Age = 40, Gender = "Masculino",
                      Activity = "Muy activo",  Goal = "Pérdida de grasa",
                      TmbEsp = 1954.8, TdeeEsp = 3714.1, ObjEsp = 3314.1 },
            };

            const double umbralAprobacion = 0.5; // ≤ 0.5 % de desviación = aprobado

            var casos = definiciones.Select(d =>
            {
                double tmbCalc  = Math.Round(CalcTmb(d.Kg, d.Cm, d.Age, d.Gender),    1);
                double tdeeCalc = Math.Round(CalcTdee(tmbCalc, d.Activity),            1);
                double objCalc  = Math.Round(CalcObjetivo(tdeeCalc, d.Goal),           1);

                double dTmb  = DesvPct(d.TmbEsp,  tmbCalc);
                double dTdee = DesvPct(d.TdeeEsp, tdeeCalc);
                double dObj  = DesvPct(d.ObjEsp,  objCalc);

                return new ValidationTestCase
                {
                    Description          = d.Desc,
                    TmbEsperado          = d.TmbEsp,
                    TmbCalculado         = tmbCalc,
                    TmbDesviacionPct     = dTmb,
                    TdeeEsperado         = d.TdeeEsp,
                    TdeeCalculado        = tdeeCalc,
                    TdeeDesviacionPct    = dTdee,
                    ObjetivoEsperado     = d.ObjEsp,
                    ObjetivoCalculado    = objCalc,
                    ObjetivoDesviacionPct = dObj,
                    Aprobado             = dTmb <= umbralAprobacion
                                        && dTdee <= umbralAprobacion
                                        && dObj  <= umbralAprobacion,
                };
            }).ToList();

            int aprobados = casos.Count(c => c.Aprobado);
            double precisionPromedio = Math.Round(
                casos.Average(c => 100.0 - ((c.TmbDesviacionPct + c.TdeeDesviacionPct + c.ObjetivoDesviacionPct) / 3.0)), 2);

            return Ok(new ValidationReport
            {
                CasosDePrueba      = casos,
                TotalCasos         = casos.Count,
                CasosAprobados     = aprobados,
                PrecisionPromedioPct = precisionPromedio,
                Conclusion         = aprobados == casos.Count
                    ? $"MODELO VALIDADO: {aprobados}/{casos.Count} casos aprobados con precisión promedio de {precisionPromedio}%."
                    : $"ATENCIÓN: {casos.Count - aprobados} caso(s) fuera del umbral de {umbralAprobacion}%."
            });
        }
    }
}
