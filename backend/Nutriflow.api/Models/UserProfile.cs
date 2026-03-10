using Postgrest.Attributes;
using Postgrest.Models;

namespace NutriFlow.Api.Models
{
    [Table("user_profiles")]
    public class UserProfile : BaseModel
    {
        [PrimaryKey("user_auth_id", false)]
        public Guid UserAuthId { get; set; } 

        [Column("name")]
        public string? Name { get; set; } 

        [Column("last_name")]
        public string? LastName { get; set; }

        [Column("phone")]
        public string? Phone { get; set; } 

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("is_verified")]
        public bool IsVerified { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }
    }
}