using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AgencyOnboarding.API.Models;

namespace AgencyOnboarding.API.Services;

public class OtpService : IOtpService
{
    private readonly AppDbContext _context;
    private readonly ILogger<OtpService> _logger;

    public OtpService(AppDbContext context, ILogger<OtpService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> IsRateLimitedAsync(string email)
    {
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == email);
        if (agency == null) return false; // If email doesn't exist, we don't rate limit (prevents enumeration)

        // Check if there was any OTP request created in the last 60 seconds
        var recentOtp = await _context.PasswordResetOtps
            .Where(o => o.AgencyId == agency.Id && o.CreatedAt > DateTime.UtcNow.AddSeconds(-60))
            .AnyAsync();

        return recentOtp;
    }

    public async Task<string> GenerateOtpAsync(int agencyId)
    {
        // 1. Invalidate any existing unused OTPs for this agency
        var existingOtps = await _context.PasswordResetOtps
            .Where(o => o.AgencyId == agencyId && !o.IsUsed)
            .ToListAsync();

        foreach (var oldOtp in existingOtps)
        {
            oldOtp.IsUsed = true; // Mark as invalidated
        }

        // 2. Generate a secure 6-digit numeric OTP using Cryptographic RandomNumberGenerator
        var otpCode = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString();

        // 3. Hash the OTP using BCrypt (never store plain text OTP)
        var hashedOtp = BCrypt.Net.BCrypt.HashPassword(otpCode);

        // 4. Create and save new OTP record
        var otpRecord = new PasswordResetOtp
        {
            AgencyId = agencyId,
            OtpHash = hashedOtp,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10), // 10-minute expiry
            IsUsed = false,
            VerificationAttempts = 0
        };

        _context.PasswordResetOtps.Add(otpRecord);
        await _context.SaveChangesAsync();

        _logger.LogInformation("[Security] New OTP generated and hashed for AgencyId: {AgencyId}", agencyId);

        return otpCode;
    }

    public async Task<bool> VerifyOtpAsync(string email, string otp)
    {
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == email);
        if (agency == null)
        {
            _logger.LogWarning("[Security] Verification attempted for unregistered email: {Email}", email);
            return false;
        }

        // Get the latest active (unused & non-expired) OTP request
        var otpRecord = await _context.PasswordResetOtps
            .Where(o => o.AgencyId == agency.Id && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpRecord == null)
        {
            _logger.LogWarning("[Security] No active OTP found for email: {Email}", email);
            return false;
        }

        // Limit OTP verification attempts (brute force protection)
        if (otpRecord.VerificationAttempts >= 5)
        {
            otpRecord.IsUsed = true; // Invalidate OTP due to too many failed attempts
            await _context.SaveChangesAsync();
            _logger.LogWarning("[Security] OTP for email {Email} invalidated due to exceeding 5 attempts.", email);
            return false;
        }

        // Increment attempts count
        otpRecord.VerificationAttempts++;
        await _context.SaveChangesAsync();

        // Verify the provided code against stored BCrypt hash
        bool isValid = BCrypt.Net.BCrypt.Verify(otp, otpRecord.OtpHash);
        
        if (!isValid)
        {
            _logger.LogWarning("[Security] Failed OTP verification attempt #{Attempts} for email: {Email}", otpRecord.VerificationAttempts, email);
        }
        else
        {
            _logger.LogInformation("[Security] OTP successfully verified for email: {Email}", email);
        }

        return isValid;
    }

    public async Task<bool> UseOtpAsync(string email, string otp)
    {
        var agency = await _context.Agencies.FirstOrDefaultAsync(a => a.Email == email);
        if (agency == null) return false;

        // Get the latest active (unused & non-expired) OTP request
        var otpRecord = await _context.PasswordResetOtps
            .Where(o => o.AgencyId == agency.Id && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpRecord == null) return false;

        // Verify the code
        bool isValid = BCrypt.Net.BCrypt.Verify(otp, otpRecord.OtpHash);
        if (!isValid || otpRecord.VerificationAttempts >= 5)
        {
            otpRecord.VerificationAttempts++;
            if (otpRecord.VerificationAttempts >= 5)
            {
                otpRecord.IsUsed = true;
            }
            await _context.SaveChangesAsync();
            return false;
        }

        // Mark OTP as used and save
        otpRecord.IsUsed = true;
        await _context.SaveChangesAsync();

        _logger.LogInformation("[Security] OTP marked as used and invalidated for email: {Email}", email);
        return true;
    }
}
