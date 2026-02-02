using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NutriFlow.Api.Data;

namespace NutriFlow.Api.Controllers
{
  public record RegisterDto(string Email, string Password);
  public record LoginDto(string Email, string Password);

  [ApiController]
  [Route("auth")]
  public class AuthController : ControllerBase
  {
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager)
    {
      _userManager = userManager;
      _signInManager = signInManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
      var user = new User { UserName = dto.Email, Email = dto.Email };
      var result = await _userManager.CreateAsync(user, dto.Password);

      if (!result.Succeeded)
      {
        return BadRequest(result.Errors.Select(e => e.Description));

      }

      return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
      var result = await _signInManager.PasswordSignInAsync(dto.Email, dto.Password, isPersistent: true, lockoutOnFailure: false);
      if(!result.Succeeded) return Unauthorized("Invalid credentials");
      return Ok(); //cookie is set
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
      await _signInManager.SignOutAsync();
      return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
      => Ok( new { auth = User.Identity?.IsAuthenticated, name = User.Identity?.Name });
  }
}
