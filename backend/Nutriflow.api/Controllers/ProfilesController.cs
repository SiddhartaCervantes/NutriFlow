using Microsoft.AspNetCore.Mvc;
using Supabase;
using NutriFlow.Api.Models;

namespace NutriFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Esto hace que la ruta sea /api/perfiles automáticamente
    public class PerfilesController : ControllerBase
    {
        private readonly Supabase.Client _supabaseClient;

        public PerfilesController(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var result = await _supabaseClient.From<UserProfile>().Get();
                
                // Aplicamos tu "limpieza" de datos (DTO)
                var perfiles = result.Models.Select(u => new {
                    u.UserAuthId,
                    u.Name,
                    u.LastName,
                    u.Phone,
                }).ToList();

                return Ok(perfiles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}