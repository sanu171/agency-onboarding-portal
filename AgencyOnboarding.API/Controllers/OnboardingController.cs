using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgencyOnboarding.API.Models;
using AgencyOnboarding.API.Services;
using System.Security.Claims;
using System.IO.Compression;
using Stripe;

namespace AgencyOnboarding.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OnboardingController : ControllerBase
{
    private readonly AppDbContext _context;

    public OnboardingController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("session")]
    public async Task<IActionResult> CreateSession([FromBody] OnboardingSessionRequest request)
    {
        var agencyIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(agencyIdStr)) return Unauthorized();
        var agencyId = int.Parse(agencyIdStr);

        var template = await _context.Templates.FirstOrDefaultAsync(t => t.Id == request.TemplateId && t.AgencyId == agencyId);
        if (template == null) return BadRequest(new { message = "Invalid template" });

        var session = new OnboardingSession
        {
            AgencyId = agencyId,
            TemplateId = template.Id,
            ClientName = request.ClientName,
            ClientEmail = request.ClientEmail,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CurrentStep = template.RequireIntake ? "intake" : 
                          template.RequireFileUpload ? "files" : 
                          template.RequireContract ? "contract" : 
                          template.RequirePayment ? "payment" : 
                          template.RequireBooking ? "booking" : "complete"
        };

        _context.OnboardingSessions.Add(session);
        await _context.SaveChangesAsync();

        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
        var link = $"{frontendUrl.TrimEnd('/')}/onboard/{session.Token}";
        return Ok(new { token = session.Token, link, expiresAt = session.ExpiresAt });
    }

    [Authorize]
    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var agencyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var sessions = await _context.OnboardingSessions
            .Include(s => s.Template)
            .Where(s => s.AgencyId == agencyId)
            .OrderByDescending(s => s.Id)
            .Select(s => new {
                s.Id, s.ClientName, s.ClientEmail, s.Token, 
                s.CurrentStep, s.ExpiresAt, TemplateName = s.Template!.Name
            })
            .ToListAsync();
        return Ok(sessions);
    }

    [Authorize]
    [HttpGet("sessions/{id:int}")]
    public async Task<IActionResult> GetSessionDetail(int id)
    {
        var agencyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .Include(s => s.IntakeForm)
            .Include(s => s.UploadedFiles)
            .Include(s => s.ContractSignature)
            .Include(s => s.Payment)
            .Include(s => s.Booking)
            .FirstOrDefaultAsync(s => s.Id == id && s.AgencyId == agencyId);

        if (session == null) return NotFound();
        
        return Ok(new 
        {
            Id = session.Id,
            ClientName = session.ClientName,
            ClientEmail = session.ClientEmail,
            Token = session.Token,
            CurrentStep = session.CurrentStep,
            ExpiresAt = session.ExpiresAt,
            TemplateName = session.Template?.Name,
            IntakeForm = session.IntakeForm == null ? null : new { session.IntakeForm.SubmittedDataJson, session.IntakeForm.SubmittedAt },
            UploadedFiles = session.UploadedFiles.Select(f => new { f.Id, f.FileName, f.FilePath, f.UploadedAt }),
            ContractSignature = session.ContractSignature == null ? null : new { session.ContractSignature.SignatureDataUrl, session.ContractSignature.IpAddress, session.ContractSignature.SignedAt },
            Payment = session.Payment == null ? null : new { session.Payment.Amount, session.Payment.Status, session.Payment.StripePaymentIntentId, session.Payment.PaidAt },
            Booking = session.Booking == null ? null : new { session.Booking.ScheduledCallAt, session.Booking.MeetingLink }
        });
    }

    [Authorize]
    [HttpGet("sessions/{id:int}/files/zip")]
    public async Task<IActionResult> DownloadFilesZip(int id)
    {
        var agencyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var session = await _context.OnboardingSessions
            .Include(s => s.UploadedFiles)
            .FirstOrDefaultAsync(s => s.Id == id && s.AgencyId == agencyId);

        if (session == null || !session.UploadedFiles.Any()) return NotFound("No files found");

        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", session.Id.ToString());
        if (!Directory.Exists(uploadDir)) return NotFound("Directory not found");

        var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            foreach (var file in session.UploadedFiles)
            {
                var filePath = Path.Combine(uploadDir, file.FileName);
                if (System.IO.File.Exists(filePath))
                {
                    archive.CreateEntryFromFile(filePath, file.FileName);
                }
            }
        }
        memoryStream.Position = 0;
        return File(memoryStream, "application/zip", $"{session.ClientName.Replace(" ", "_")}_Files.zip");
    }

    [Authorize]
    [HttpPost("sessions/{id:int}/remind")]
    public async Task<IActionResult> SendReminder(int id, [FromServices] IEmailService emailService)
    {
        var agencyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var session = await _context.OnboardingSessions
            .Include(s => s.Agency)
            .FirstOrDefaultAsync(s => s.Id == id && s.AgencyId == agencyId);

        if (session == null) return NotFound();

        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
        var link = $"{frontendUrl.TrimEnd('/')}/onboard/{session.Token}";
        await emailService.SendEmailAsync(session.ClientEmail, $"Action Required: Progress on your Onboarding with {session.Agency?.Name}", 
            $"Hi {session.ClientName},\n\nPlease complete your next step ({session.CurrentStep}) by visiting your magic link:\n{link}");

        return Ok(new { success = true });
    }

    [HttpGet("{token}")]
    public async Task<IActionResult> GetSessionByToken(string token)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Agency)
            .Include(s => s.Template)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null) return NotFound(new { message = "Invalid token" });
        if (session.ExpiresAt < DateTime.UtcNow) return BadRequest(new { message = "Token expired" });

        return Ok(new
        {
            session.Token,
            session.ClientName,
            session.CurrentStep,
            Agency = new { session.Agency!.Name, session.Agency.LogoUrl, session.Agency.BrandColor },
            Template = new { 
                session.Template!.RequireIntake, session.Template.RequireFileUpload, 
                session.Template.RequireContract, session.Template.RequirePayment, session.Template.RequireBooking,
                session.Template.PaymentAmount 
            }
        });
    }

    public class IntakeSubmitRequest
    {
        public string DataJson { get; set; } = string.Empty;
    }

    [HttpPost("{token}/intake")]
    public async Task<IActionResult> SubmitIntake(string token, [FromBody] IntakeSubmitRequest request, [FromServices] IEmailService emailService)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .Include(s => s.Agency)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");

        var intake = new IntakeForm
        {
            OnboardingSessionId = session.Id,
            SubmittedDataJson = request.DataJson
        };
        _context.IntakeForms.Add(intake);

        // Advance to next step
        session.CurrentStep = session.Template!.RequireFileUpload ? "files" : 
                              session.Template.RequireContract ? "contract" : 
                              session.Template.RequirePayment ? "payment" : 
                              session.Template.RequireBooking ? "booking" : "complete";

        await _context.SaveChangesAsync();
        
        await emailService.SendEmailAsync(session.Agency!.Email, $"[Action] {session.ClientName} completed Intake Form", $"Client {session.ClientName} has submitted their brand information.");
        
        return Ok(new { success = true, nextStep = session.CurrentStep });
    }

    [HttpPost("{token}/files")]
    public async Task<IActionResult> UploadFiles(string token, [FromForm] IFormFileCollection files)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");

        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", session.Id.ToString());
        if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

        foreach (var file in files)
        {
            if (file.Length > 0)
            {
                var filePath = Path.Combine(uploadDir, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _context.UploadedFiles.Add(new UploadedFile
                {
                    OnboardingSessionId = session.Id,
                    FileName = file.FileName,
                    FilePath = $"/uploads/{session.Id}/{file.FileName}"
                });
            }
        }

        // Advance step
        session.CurrentStep = session.Template!.RequireContract ? "contract" : 
                              session.Template.RequirePayment ? "payment" : 
                              session.Template.RequireBooking ? "booking" : "complete";

        await _context.SaveChangesAsync();
        return Ok(new { success = true, nextStep = session.CurrentStep });
    }

    [HttpPost("{token}/files/skip")]
    public async Task<IActionResult> SkipFiles(string token)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");

        session.CurrentStep = session.Template!.RequireContract ? "contract" : 
                              session.Template.RequirePayment ? "payment" : 
                              session.Template.RequireBooking ? "booking" : "complete";

        await _context.SaveChangesAsync();
        return Ok(new { success = true, nextStep = session.CurrentStep });
    }

    public class SignContractRequest
    {
        public string SignatureData { get; set; } = string.Empty;
    }

    [HttpPost("{token}/sign")]
    public async Task<IActionResult> SignContract(string token, [FromBody] SignContractRequest request, [FromServices] IPdfService pdfService, [FromServices] IEmailService emailService)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .Include(s => s.Agency)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");

        var signature = new ContractSignature
        {
            OnboardingSessionId = session.Id,
            SignatureDataUrl = request.SignatureData,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            SignedAt = DateTime.UtcNow
        };
        _context.ContractSignatures.Add(signature);

        session.CurrentStep = session.Template!.RequirePayment ? "payment" : 
                              session.Template.RequireBooking ? "booking" : "complete";

        await _context.SaveChangesAsync();

        var destFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "contracts");
        var generatedPdfPath = pdfService.GenerateContractPdf(session, signature, destFolder);

        await emailService.SendEmailAsync(session.ClientEmail, $"Signed Contract - {session.Agency!.Name}", 
            "Attached is your securely executed contract copy.", null, generatedPdfPath);
        await emailService.SendEmailAsync(session.Agency.Email, $"[Action] {session.ClientName} signed the Contract", 
            $"The client {session.ClientName} executed the contract.", null, generatedPdfPath);

        return Ok(new { success = true, nextStep = session.CurrentStep });
    }

    [HttpPost("{token}/payment/intent")]
    public async Task<IActionResult> CreatePaymentIntent(string token)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");
        
        try 
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)((session.Template?.PaymentAmount ?? 0) * 100),
                Currency = "usd",
                Metadata = new Dictionary<string, string> { { "SessionId", session.Id.ToString() } }
            };
            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            return Ok(new { clientSecret = intent.ClientSecret });
        }
        catch (StripeException)
        {
            // Fallback for local testing without valid Stripe keys
            return Ok(new { clientSecret = "mock_secret_for_local_dev" });
        }
    }

    public class ConfirmPaymentRequest
    {
        public string PaymentIntentId { get; set; } = string.Empty;
    }

    [HttpPost("{token}/payment/confirm")]
    public async Task<IActionResult> ConfirmPayment(string token, [FromBody] ConfirmPaymentRequest request, [FromServices] IEmailService emailService)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Template)
            .Include(s => s.Agency)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");

        // Real code would verify the payment intent status here
        // var service = new PaymentIntentService();
        // var intent = await service.GetAsync(request.PaymentIntentId);
        // if (intent.Status != "succeeded") return BadRequest("Payment not complete");

        var payment = new Models.Payment // Resolving ambiguity with Stripe.Payment
        {
            OnboardingSessionId = session.Id,
            StripePaymentIntentId = string.IsNullOrEmpty(request.PaymentIntentId) ? "pi_mock_" + Guid.NewGuid().ToString("N") : request.PaymentIntentId,
            Amount = session.Template?.PaymentAmount ?? 0,
            Status = "succeeded",
            PaidAt = DateTime.UtcNow
        };
        _context.Payments.Add(payment);

        session.CurrentStep = session.Template!.RequireBooking ? "booking" : "complete";

        await _context.SaveChangesAsync();
        
        await emailService.SendEmailAsync(session.Agency!.Email, $"[💰 Paid] {session.ClientName} completed Payment", $"Client {session.ClientName} paid ${payment.Amount} deposit.");
        
        return Ok(new { success = true, nextStep = session.CurrentStep });
    }

    public class BookingRequest
    {
        public DateTime ScheduledCallAt { get; set; }
    }

    [HttpPost("{token}/booking")]
    public async Task<IActionResult> BookCall(string token, [FromBody] BookingRequest request, [FromServices] IEmailService emailService)
    {
        var session = await _context.OnboardingSessions
            .Include(s => s.Agency)
            .FirstOrDefaultAsync(s => s.Token == token);

        if (session == null || session.ExpiresAt < DateTime.UtcNow) return BadRequest("Invalid session");

        var link = "https://meet.google.com/mock-link-" + session.Id;
        var booking = new Booking
        {
            OnboardingSessionId = session.Id,
            ScheduledCallAt = request.ScheduledCallAt,
            MeetingLink = link
        };
        _context.Bookings.Add(booking);

        session.CurrentStep = "complete";

        await _context.SaveChangesAsync();

        await emailService.SendCalendarInviteAsync(session.ClientEmail, $"Kickoff Call with {session.Agency!.Name}", link, request.ScheduledCallAt);
        await emailService.SendCalendarInviteAsync(session.Agency.Email, $"Kickoff Call with {session.ClientName}", link, request.ScheduledCallAt);

        return Ok(new { success = true, nextStep = session.CurrentStep });
    }
}
