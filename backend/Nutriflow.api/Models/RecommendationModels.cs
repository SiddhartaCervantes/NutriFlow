namespace NutriFlow.Api.Models
{
    public class RecommendationRequest
    {
        public decimal WeightKg { get; set; }
        public decimal HeightCm { get; set; }
        public int Age { get; set; }
        // "Masculino" | "Femenino"
        public string Gender { get; set; } = string.Empty;
        // "Pérdida de grasa" | "Mantenimiento" | "Ganancia muscular"
        public string Goal { get; set; } = string.Empty;
        // "Sedentario" | "Ligero" | "Moderado" | "Activo" | "Muy activo"
        public string ActivityLevel { get; set; } = "Sedentario";
    }

    public class NutritionalTargets
    {
        public double Tmb { get; set; }
        public double Tdee { get; set; }
        public double DailyCalorieTarget { get; set; }
        public double ProteinTargetG { get; set; }
        public double CarbsTargetG { get; set; }
        public double FatTargetG { get; set; }
    }

    public class RecipeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Calories { get; set; }
        public decimal ProteinG { get; set; }
        public decimal CarbsG { get; set; }
        public decimal FatG { get; set; }
        public int PrepTimeMin { get; set; }
        public string Difficulty { get; set; } = string.Empty;
    }

    public class MealRecommendation
    {
        public string Slot { get; set; } = string.Empty;
        public int TargetCalories { get; set; }
        public RecipeDto? Recipe { get; set; }
        // Absolute kcal difference between the selected recipe and the meal target
        public int CalorieDeviation { get; set; }
        // Percentage precision: 100 - (|deviation| / target * 100)
        public double CalorieAccuracyPct { get; set; }
    }

    public class RecommendationResponse
    {
        public NutritionalTargets Targets { get; set; } = new();
        public List<MealRecommendation> Meals { get; set; } = new();
        public string Summary { get; set; } = string.Empty;
        // Average caloric accuracy across the three meals
        public double OverallAccuracyPct { get; set; }
        // Number of recipes available in the knowledge base at generation time
        public int KnowledgeBaseSize { get; set; }
    }

    // ── Validation model ────────────────────────────────────────────────────────
    public class ValidationTestCase
    {
        public string Description { get; set; } = string.Empty;
        public double TmbEsperado { get; set; }
        public double TmbCalculado { get; set; }
        public double TmbDesviacionPct { get; set; }
        public double TdeeEsperado { get; set; }
        public double TdeeCalculado { get; set; }
        public double TdeeDesviacionPct { get; set; }
        public double ObjetivoEsperado { get; set; }
        public double ObjetivoCalculado { get; set; }
        public double ObjetivoDesviacionPct { get; set; }
        public bool Aprobado { get; set; }
    }

    public class ValidationReport
    {
        public List<ValidationTestCase> CasosDePrueba { get; set; } = new();
        public int TotalCasos { get; set; }
        public int CasosAprobados { get; set; }
        public double PrecisionPromedioPct { get; set; }
        public string Conclusion { get; set; } = string.Empty;
    }
}
