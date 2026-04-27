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
                Meals =
                [
                    new() { Slot = "Desayuno", TargetCalories = breakfastTarget, Recipe = breakfast },
                    new() { Slot = "Comida",   TargetCalories = lunchTarget,     Recipe = lunch     },
                    new() { Slot = "Cena",     TargetCalories = dinnerTarget,    Recipe = dinner    }
                ],
                Summary = $"Plan de {Math.Round(caloricTarget)} kcal/día · " +
                           $"{Math.Round(proteinTarget)}g proteína · " +
                           $"{Math.Round(carbTarget)}g carbohidratos · " +
                           $"{Math.Round(fatTarget)}g grasas · " +
                           $"Objetivo: {request.Goal}"
            };

            return Ok(response);
        }
    }
}
