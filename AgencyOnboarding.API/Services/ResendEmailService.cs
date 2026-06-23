using Resend;

namespace AgencyOnboarding.API.Services;

/// <summary>
/// Sends transactional emails via the Resend API.
/// Falls back to console logging if the API key is not configured (safe for local dev).
/// </summary>
public class ResendEmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly IConfiguration _config;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(IResend resend, IConfiguration config, ILogger<ResendEmailService> logger)
    {
        _resend = resend;
        _config = config;
        _logger = logger;
    }

    private string FromAddress =>
        $"{_config["Resend:FromName"] ?? "OnBoardly"} <{_config["Resend:FromEmail"] ?? "onboarding@yourdomain.com"}>";

    public async Task SendEmailAsync(
        string to,
        string subject,
        string textBody,
        string? htmlBody = null,
        string? attachmentPath = null)
    {
        var apiKey = _config["Resend:ApiKey"] ?? "";
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "re_YOUR_API_KEY_HERE")
        {
            // Dev fallback — log to console instead of hitting the API
            _logger.LogInformation("\n[RESEND — DEV FALLBACK]\nTO: {To}\nSUBJECT: {Subject}\nBODY:\n{Body}\n", to, subject, textBody);
            return;
        }

        var message = new EmailMessage
        {
            From = FromAddress,
            To = { to },
            Subject = subject,
            TextBody = textBody,
            HtmlBody = htmlBody
        };

        try
        {
            await _resend.EmailSendAsync(message);
            _logger.LogInformation("[Resend] Email sent to {To} — Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Resend] Failed to send email to {To}", to);
            throw;
        }
    }

    public Task SendCalendarInviteAsync(string to, string subject, string meetingLink, DateTime scheduledTime)
    {
        // For calendar invites, fall through to the same email mechanism
        var body = $"Your kickoff call is scheduled.\n\nTime: {scheduledTime:f} UTC\nMeeting Link: {meetingLink}";
        return SendEmailAsync(to, subject, body);
    }

    /// <summary>
    /// Sends a branded OTP email for password reset.
    /// </summary>
    public async Task SendOtpEmailAsync(string to, string agencyEmail, string otp)
    {
        _logger.LogInformation("\n==================================================\n[OTP EMAIL] TO: {To}\nOTP CODE: {Otp}\n==================================================\n", to, otp);

        var subject = "Your OnBoardly Password Reset Code";

        var textBody = $"Your OnBoardly password reset OTP is: {otp}\n\nThis code expires in 15 minutes.\nIf you did not request this, please ignore this email.";

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
      <h1>OnBoardly</h1>
      <p>Password Reset Request</p>
    </div>
    <div class='body'>
      <p>We received a request to reset your password. Use the code below to proceed.</p>
      <div class='otp-box'>
        <div class='otp-code'>{otp}</div>
        <div class='otp-note'>⏱ Expires in <strong>15 minutes</strong></div>
      </div>
      <p style='font-size:13px; color:#6b7280;'>If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
    </div>
    <div class='footer'>OnBoardly · Sent to {to}</div>
  </div>
</body>
</html>";

        await SendEmailAsync(to, subject, textBody, htmlBody);
    }
}
