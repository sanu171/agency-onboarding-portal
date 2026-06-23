using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgencyOnboarding.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Hangfire;
using AgencyOnboarding.API.Services;

namespace AgencyOnboarding.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ResendEmailService _emailService;

    public AuthController(AppDbContext context, IConfiguration configuration, ResendEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
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

    // -------------------------------------------------------------------------
    // Forgot Password — Step 1: Request OTP
    // -------------------------------------------------------------------------
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        // Check whether the email exists in the database
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (agency == null)
            return BadRequest(new { message = "This email is not registered with any agency. Please check the spelling or sign up." });

        // Generate a 6-digit numeric OTP
        var otp = new Random().Next(100_000, 999_999).ToString();

        // Store BCrypt hash (never store the raw OTP) and a 15-minute expiry
        agency.PasswordResetOtpHash = BCrypt.Net.BCrypt.HashPassword(otp);
        agency.PasswordResetOtpExpiry = DateTime.UtcNow.AddMinutes(15);
        await _context.SaveChangesAsync();

        // Enqueue the email as a Hangfire background job — API returns immediately
        // Capture values for the closure (avoid capturing EF-tracked entity)
        var emailTo = agency.Email;
        BackgroundJob.Enqueue(() => _emailService.SendOtpEmailAsync(emailTo, emailTo, otp));

        return Ok(new { message = "If that email exists, you will receive an OTP shortly." });
    }

    // -------------------------------------------------------------------------
    // Reset Password — Step 2: Verify OTP + Set New Password
    // -------------------------------------------------------------------------
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (agency == null)
            return BadRequest(new { message = "Invalid request." });

        // Check expiry
        if (agency.PasswordResetOtpExpiry == null || DateTime.UtcNow > agency.PasswordResetOtpExpiry)
            return BadRequest(new { message = "OTP has expired. Please request a new one." });

        // Verify OTP against hash
        if (string.IsNullOrEmpty(agency.PasswordResetOtpHash) ||
            !BCrypt.Net.BCrypt.Verify(request.Otp, agency.PasswordResetOtpHash))
            return BadRequest(new { message = "Invalid OTP. Please check the code and try again." });

        // All good — update password and clear OTP fields
        agency.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        agency.PasswordResetOtpHash = null;
        agency.PasswordResetOtpExpiry = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully." });
    }

    private string GenerateJwtToken(Agency agency)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "AgencyOnboardingSuperSecretKeyForDevelopmentOnlyPleaseChangeInProduction");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, agency.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, agency.Email),
            new Claim(ClaimTypes.Name, agency.Name)
        };

        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"] ?? "AgencyOnboarding.API",
            audience: jwtSettings["Audience"] ?? "AgencyOnboarding.Frontend",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? BrandColor { get; set; }
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
