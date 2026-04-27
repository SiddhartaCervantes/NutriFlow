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
    }

    public class RecommendationResponse
    {
        public NutritionalTargets Targets { get; set; } = new();
        public List<MealRecommendation> Meals { get; set; } = new();
        public string Summary { get; set; } = string.Empty;
    }
}
