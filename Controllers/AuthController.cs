using BibliotecaApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BibliotecaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string DemoEmail = "admin@biblioteca.com";
    private const string DemoPassword = "biblioteca123";
    private const string DemoName = "Bibliotecario";
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login(LoginRequestDto request)
    {
        if (!string.Equals(request.Email.Trim(), DemoEmail, StringComparison.OrdinalIgnoreCase)
            || request.Password != DemoPassword)
        {
            return Unauthorized("Credenciais invalidas.");
        }

        var expiresAt = DateTime.UtcNow.AddHours(4);
        var token = CreateToken(request.Email.Trim().ToLowerInvariant(), expiresAt);

        return Ok(new LoginResponseDto
        {
            Token = token,
            Email = DemoEmail,
            Name = DemoName,
            ExpiresAt = expiresAt
        });
    }

    [HttpGet("me")]
    public ActionResult<object> Me()
    {
        return Ok(new
        {
            email = User.FindFirstValue(ClaimTypes.Email),
            name = User.FindFirstValue(ClaimTypes.Name),
            authenticated = User.Identity?.IsAuthenticated ?? false
        });
    }

    private string CreateToken(string email, DateTime expiresAt)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key nao configurado.");
        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("Jwt:Issuer nao configurado.");
        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("Jwt:Audience nao configurado.");

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, DemoName),
            new Claim(JwtRegisteredClaimNames.Sub, email)
        };
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
