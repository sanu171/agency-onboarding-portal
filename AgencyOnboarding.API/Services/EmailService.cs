using System.Diagnostics;
using Microsoft.Extensions.Logging;

namespace AgencyOnboarding.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string textBody, string? htmlBody = null, string? attachmentPath = null);
    Task SendCalendarInviteAsync(string to, string subject, string meetingLink, DateTime scheduledTime);
}

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string textBody, string? htmlBody = null, string? attachmentPath = null)
    {
        _logger.LogInformation("\n=========================================\n");
        _logger.LogInformation($"[MOCK EMAIL SENT] TO: {to}");
        _logger.LogInformation($"SUBJECT: {subject}");
        _logger.LogInformation($"BODY:\n{textBody}");
        if (attachmentPath != null) _logger.LogInformation($"ATTACHMENT: {Path.GetFileName(attachmentPath)} included!");
        _logger.LogInformation("\n=========================================\n");
        return Task.CompletedTask;
    }

    public Task SendCalendarInviteAsync(string to, string subject, string meetingLink, DateTime scheduledTime)
    {
        var icsContent = $@"BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Agency Onboarding//NONSGML v1.0//EN
BEGIN:VEVENT
UID:{Guid.NewGuid()}
DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}
DTSTART:{scheduledTime.ToUniversalTime():yyyyMMddTHHmmssZ}
DTEND:{scheduledTime.ToUniversalTime().AddMinutes(30):yyyyMMddTHHmmssZ}
SUMMARY:{subject}
DESCRIPTION:Kickoff Call. Meeting link: {meetingLink}
END:VEVENT
END:VCALENDAR";

        _logger.LogInformation("\n=========================================\n");
        _logger.LogInformation($"[MOCK CALENDAR INVITE .ics SENT] TO: {to}");
        _logger.LogInformation($"SUBJECT: {subject}");
        _logger.LogInformation($"ICS CONTENT:\n{icsContent}");
        _logger.LogInformation("\n=========================================\n");

        return Task.CompletedTask;
    }
}
