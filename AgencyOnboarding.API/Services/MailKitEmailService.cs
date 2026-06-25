using System.IO;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AgencyOnboarding.API.Services;

public class MailKitEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<MailKitEmailService> _logger;

    public MailKitEmailService(IConfiguration config, ILogger<MailKitEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string textBody,
        string? htmlBody = null,
        string? attachmentPath = null)
    {
        var host = _config["Smtp:Host"] ?? "";
        var portStr = _config["Smtp:Port"] ?? "587";
        var username = _config["Smtp:Username"] ?? "";
        var password = _config["Smtp:Password"] ?? "";
        var enableSsl = bool.Parse(_config["Smtp:EnableSsl"] ?? "true");
        var fromEmail = _config["Smtp:FromEmail"] ?? "no-reply@onboardly.com";
        var fromName = _config["Smtp:FromName"] ?? "OnBoardly Support";

        // Dev fallback if SMTP is not configured
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username))
        {
            _logger.LogInformation("\n=========================================\n[SMTP DEV FALLBACK] (SMTP settings unconfigured)\nTO: {To}\nSUBJECT: {Subject}\nBODY:\n{Body}\n=========================================\n", to, subject, htmlBody ?? textBody);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            TextBody = textBody,
            HtmlBody = htmlBody
        };

        if (!string.IsNullOrEmpty(attachmentPath) && File.Exists(attachmentPath))
        {
            await bodyBuilder.Attachments.AddAsync(attachmentPath);
        }

        message.Body = bodyBuilder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            
            // Connect to SMTP Server
            var secureSocketOption = enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
            if (enableSsl && int.Parse(portStr) == 465)
            {
                secureSocketOption = SecureSocketOptions.SslOnConnect;
            }

            await client.ConnectAsync(host, int.Parse(portStr), secureSocketOption);
            
            // Authenticate if credentials are provided
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
            {
                await client.AuthenticateAsync(username, password);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("[MailKit] Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[MailKit] Error sending email to {To}", to);
            throw;
        }
    }

    public async Task SendCalendarInviteAsync(string to, string subject, string meetingLink, DateTime scheduledTime)
    {
        var body = $"Your kickoff call is scheduled.\n\nTime: {scheduledTime:f} UTC\nMeeting Link: {meetingLink}";
        
        // Construct standard calendar ICS attachment file
        var icsContent = $@"BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OnBoardly//NONSGML v1.0//EN
BEGIN:VEVENT
UID:{Guid.NewGuid()}
DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}
DTSTART:{scheduledTime.ToUniversalTime():yyyyMMddTHHmmssZ}
DTEND:{scheduledTime.ToUniversalTime().AddMinutes(30):yyyyMMddTHHmmssZ}
SUMMARY:{subject}
DESCRIPTION:Kickoff Call. Meeting link: {meetingLink}
END:VEVENT
END:VCALENDAR";

        var tempFilePath = Path.Combine(Path.GetTempPath(), $"invite-{Guid.NewGuid()}.ics");
        try
        {
            await File.WriteAllTextAsync(tempFilePath, icsContent);
            await SendEmailAsync(to, subject, body, htmlBody: null, attachmentPath: tempFilePath);
        }
        finally
        {
            if (File.Exists(tempFilePath))
            {
                File.Delete(tempFilePath);
            }
        }
    }
}
