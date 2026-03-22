namespace AgencyOnboarding.API.Models;

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string AgencyName { get; set; } = string.Empty;
    public int AgencyId { get; set; }
}

public class TemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public bool RequireIntake { get; set; } = true;
    public bool RequireFileUpload { get; set; } = true;
    public bool RequireContract { get; set; } = true;
    public bool RequirePayment { get; set; } = true;
    public bool RequireBooking { get; set; } = true;
    public string? IntakeFormConfigJson { get; set; }
    public string? ContractText { get; set; }
    public decimal? PaymentAmount { get; set; }
}

public class TemplateResponse : TemplateRequest
{
    public int Id { get; set; }
}

public class OnboardingSessionRequest
{
    public int TemplateId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
}
