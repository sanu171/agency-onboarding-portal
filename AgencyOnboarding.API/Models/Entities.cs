using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgencyOnboarding.API.Models;

public class Agency
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? BrandColor { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Template> Templates { get; set; } = new List<Template>();
    public ICollection<OnboardingSession> Sessions { get; set; } = new List<OnboardingSession>();
}

public class Template
{
    public int Id { get; set; }
    public int AgencyId { get; set; }
    public Agency? Agency { get; set; }
    public string Name { get; set; } = string.Empty;
    
    // JSON arrays or strings to store required steps config
    public bool RequireIntake { get; set; } = true;
    public bool RequireFileUpload { get; set; } = true;
    public bool RequireContract { get; set; } = true;
    public bool RequirePayment { get; set; } = true;
    public bool RequireBooking { get; set; } = true;

    public string? IntakeFormConfigJson { get; set; }
    public string? ContractText { get; set; }
    public decimal? PaymentAmount { get; set; }
}

public class OnboardingSession
{
    public int Id { get; set; }
    public int AgencyId { get; set; }
    public Agency? Agency { get; set; }
    public int TemplateId { get; set; }
    public Template? Template { get; set; }
    
    public string Token { get; set; } = Guid.NewGuid().ToString("N");
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
    public string CurrentStep { get; set; } = "intake"; // intake, files, contract, payment, booking, complete
    
    public IntakeForm? IntakeForm { get; set; }
    public ICollection<UploadedFile> UploadedFiles { get; set; } = new List<UploadedFile>();
    public ContractSignature? ContractSignature { get; set; }
    public Payment? Payment { get; set; }
    public Booking? Booking { get; set; }
}

public class IntakeForm
{
    public int Id { get; set; }
    public int OnboardingSessionId { get; set; }
    public OnboardingSession? Session { get; set; }
    public string SubmittedDataJson { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}

public class UploadedFile
{
    public int Id { get; set; }
    public int OnboardingSessionId { get; set; }
    public OnboardingSession? Session { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public class ContractSignature
{
    public int Id { get; set; }
    public int OnboardingSessionId { get; set; }
    public OnboardingSession? Session { get; set; }
    public string SignatureDataUrl { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime SignedAt { get; set; } = DateTime.UtcNow;
}

public class Payment
{
    public int Id { get; set; }
    public int OnboardingSessionId { get; set; }
    public OnboardingSession? Session { get; set; }
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, succeeded
    public decimal Amount { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class Booking
{
    public int Id { get; set; }
    public int OnboardingSessionId { get; set; }
    public OnboardingSession? Session { get; set; }
    public DateTime ScheduledCallAt { get; set; }
    public string? MeetingLink { get; set; }
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;
}
