using System.Threading.Tasks;

namespace AgencyOnboarding.API.Services;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(int agencyId);
    Task<bool> VerifyOtpAsync(string email, string otp);
    Task<bool> UseOtpAsync(string email, string otp);
    Task<bool> IsRateLimitedAsync(string email);
}
