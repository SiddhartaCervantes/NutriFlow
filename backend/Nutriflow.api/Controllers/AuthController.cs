using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace NutriFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpFactory;

        public AuthController(IConfiguration config, IHttpClientFactory httpFactory)
        {
            _config      = config;
            _httpFactory = httpFactory;
        }

        public record InviteRequest(string Email);

        [HttpPost("invite")]
        public async Task<IActionResult> InvitePatient([FromBody] InviteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("El email es requerido.");

            var supabaseUrl = _config["Supabase:Url"]!.TrimEnd('/');
            var serviceKey  = _config["Supabase:Key"]!;

            var client = _httpFactory.CreateClient();
            client.DefaultRequestHeaders.Add("apikey", serviceKey);
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", serviceKey);

            var body = JsonSerializer.Serialize(new
            {
                email       = request.Email,
                redirect_to = "https://nutriflowpro.vercel.app/patient-portal"
            });

            var response = await client.PostAsync(
                $"{supabaseUrl}/auth/v1/invite",
                new StringContent(body, Encoding.UTF8, "application/json")
            );

            if (response.IsSuccessStatusCode)
                return Ok(new { message = "Invitación enviada." });

            var error = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, new { error });
        }
    }
}
