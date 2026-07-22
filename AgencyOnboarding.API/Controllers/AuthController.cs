using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgencyOnboarding.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using AgencyOnboarding.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace AgencyOnboarding.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IOtpService _otpService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext context,
        IConfiguration configuration,
        IEmailService emailService,
        IOtpService otpService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _otpService = otpService;
        _logger = logger;
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
        // 1. Rate limit OTP generation requests per email
        bool isRateLimited = await _otpService.IsRateLimitedAsync(request.Email);
        if (isRateLimited)
        {
            _logger.LogWarning("[Security] OTP generation rate-limited for email: {Email}", request.Email);
            return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Too many OTP requests. Please wait a minute and try again." });
        }

        // 2. Prevent user enumeration (return generic response even if email doesn't exist)
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (agency == null)
        {
            _logger.LogInformation("[Security] OTP requested for unregistered email: {Email}", request.Email);
            return Ok(new { message = "If that email exists, you will receive an OTP shortly." });
        }

        // 3. Generate secure OTP
        var otp = await _otpService.GenerateOtpAsync(agency.Id);

        // 4. Log OTP in development console for easy local testing
        _logger.LogInformation("\n==================================================\n[OTP EMAIL] TO: {To}\nOTP CODE: {Otp}\n==================================================\n", request.Email, otp);

        // 5. Send OTP email using MailKit asynchronously
        var emailSubject = "Your Onvora Password Reset Code";
        var textBody = $"Your Onvora password reset OTP is: {otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, please ignore this email.";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6fa; margin: 0; padding: 0; }}
    .wrapper {{ max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }}
    .header p {{ color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }}
    .body {{ padding: 36px 40px; }}
    .otp-box {{ background: #f0f4ff; border: 2px solid #c7d7fd; border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #2563eb; font-family: monospace; }}
    .otp-note {{ font-size: 13px; color: #6b7280; margin-top: 10px; }}
    .footer {{ padding: 20px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }}
    p {{ color: #374151; line-height: 1.6; font-size: 15px; margin: 0 0 16px; }}
  </style>
</head>
<body>
  <div class='wrapper'>
    <div class='header'>
      <h1>Onvora</h1>
      <p>Password Reset Request</p>
    </div>
    <div class='body'>
      <p>We received a request to reset your password. Use the code below to proceed.</p>
      <div class='otp-box'>
        <div class='otp-code'>{otp}</div>
        <div class='otp-note'>⏱ Expires in <strong>10 minutes</strong></div>
      </div>
      <p style='font-size:13px; color:#6b7280;'>If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
    </div>
    <div class='footer'>Onvora · Sent to {request.Email}</div>
  </div>
</body>
</html>";

        // Dispatch background email task to avoid blocking the HTTP thread
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendEmailAsync(request.Email, emailSubject, textBody, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Security] Failed to send OTP email to {Email} in background task.", request.Email);
            }
        });

        return Ok(new { message = "If that email exists, you will receive an OTP shortly." });
    }

    // -------------------------------------------------------------------------
    // Verify OTP — Step 2: Check OTP Validity
    // -------------------------------------------------------------------------
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        bool isValid = await _otpService.VerifyOtpAsync(request.Email, request.Otp);
        if (!isValid)
        {
            return BadRequest(new { message = "Invalid or expired OTP." });
        }
        return Ok(new { message = "OTP verified successfully." });
    }

    // -------------------------------------------------------------------------
    // Reset Password — Step 3: Verify OTP + Set New Password
    // -------------------------------------------------------------------------
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        // Enforce strong password requirements
        if (string.IsNullOrWhiteSpace(request.NewPassword) ||
            request.NewPassword.Length < 8 ||
            !request.NewPassword.Any(char.IsDigit) ||
            !request.NewPassword.Any(char.IsLetter))
        {
            return BadRequest(new { message = "Password must be at least 8 characters long and contain both letters and numbers." });
        }

        bool isOtpValid = await _otpService.UseOtpAsync(request.Email, request.Otp);
        if (!isOtpValid)
        {
            return BadRequest(new { message = "Invalid or expired OTP." });
        }

        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (agency == null)
        {
            return BadRequest(new { message = "Invalid request." });
        }

        // All good — update password securely
        agency.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        _logger.LogInformation("[Security] Password successfully reset for agency email: {Email}", request.Email);

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
