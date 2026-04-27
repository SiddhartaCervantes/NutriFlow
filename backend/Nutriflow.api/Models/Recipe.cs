using Postgrest.Attributes;
using Postgrest.Models;

namespace NutriFlow.Api.Models
{
    [Table("recipes")]
    public class Recipe : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Column("calories")]
        public int Calories { get; set; }

        [Column("protein_g")]
        public decimal ProteinG { get; set; }

        [Column("carbs_g")]
        public decimal CarbsG { get; set; }

        [Column("fat_g")]
        public decimal FatG { get; set; }

        [Column("prep_time_min")]
        public int PrepTimeMin { get; set; }

        [Column("difficulty")]
        public string? Difficulty { get; set; }

        [Column("instructions")]
        public string? Instructions { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }
    }
}
