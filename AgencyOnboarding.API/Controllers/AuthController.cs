using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgencyOnboarding.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace AgencyOnboarding.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Agencies.AnyAsync(a => a.Email == request.Email))
            return BadRequest(new { message = "Email already in use" });

        var agency = new Agency
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Agencies.Add(agency);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(agency);
        return Ok(new AuthResponse { Token = token, AgencyName = agency.Name, AgencyId = agency.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == request.Email);
        
        if (agency == null || !BCrypt.Net.BCrypt.Verify(request.Password, agency.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var token = GenerateJwtToken(agency);
        return Ok(new AuthResponse { Token = token, AgencyName = agency.Name, AgencyId = agency.Id });
    }

    private string GenerateJwtToken(Agency agency)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, agency.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, agency.Email),
            new Claim(ClaimTypes.Name, agency.Name)
        };

        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var agencyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var agency = await _context.Agencies.FindAsync(agencyId);
        if (agency == null) return NotFound();

        return Ok(new
        {
            agencyName = agency.Name,
            email = agency.Email,
            logoUrl = agency.LogoUrl,
            brandColor = agency.BrandColor
        });
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? BrandColor { get; set; }
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var agencyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var agency = await _context.Agencies.FindAsync(agencyId);
        if (agency == null) return NotFound();

        agency.Name = request.Name;
        agency.LogoUrl = request.LogoUrl;
        agency.BrandColor = request.BrandColor;

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            message = "Profile updated", 
            agencyName = agency.Name, 
            logoUrl = agency.LogoUrl,
            brandColor = agency.BrandColor 
        });
    }
}
