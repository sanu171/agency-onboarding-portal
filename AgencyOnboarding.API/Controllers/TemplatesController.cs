using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgencyOnboarding.API.Models;
using System.Security.Claims;

namespace AgencyOnboarding.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TemplatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TemplatesController(AppDbContext context)
    {
        _context = context;
    }

    private int GetAgencyId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
    }

    [HttpGet]
    public async Task<IActionResult> GetTemplates()
    {
        var agencyId = GetAgencyId();
        var templates = await _context.Templates
            .Where(t => t.AgencyId == agencyId)
            .OrderByDescending(t => t.Id)
            .Select(t => new TemplateResponse
            {
                Id = t.Id,
                Name = t.Name,
                RequireIntake = t.RequireIntake,
                RequireFileUpload = t.RequireFileUpload,
                RequireContract = t.RequireContract,
                RequirePayment = t.RequirePayment,
                RequireBooking = t.RequireBooking,
                IntakeFormConfigJson = t.IntakeFormConfigJson,
                ContractText = t.ContractText,
                PaymentAmount = t.PaymentAmount
            })
            .ToListAsync();

        return Ok(templates);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTemplate([FromBody] TemplateRequest request)
    {
        var agencyId = GetAgencyId();

        var template = new Template
        {
            AgencyId = agencyId,
            Name = request.Name,
            RequireIntake = request.RequireIntake,
            RequireFileUpload = request.RequireFileUpload,
            RequireContract = request.RequireContract,
            RequirePayment = request.RequirePayment,
            RequireBooking = request.RequireBooking,
            IntakeFormConfigJson = request.IntakeFormConfigJson,
            ContractText = request.ContractText,
            PaymentAmount = request.PaymentAmount
        };

        _context.Templates.Add(template);
        await _context.SaveChangesAsync();

        return Ok(new { id = template.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] TemplateRequest request)
    {
        var agencyId = GetAgencyId();
        var template = await _context.Templates.FirstOrDefaultAsync(t => t.Id == id && t.AgencyId == agencyId);

        if (template == null) return NotFound();

        template.Name = request.Name;
        template.RequireIntake = request.RequireIntake;
        template.RequireFileUpload = request.RequireFileUpload;
        template.RequireContract = request.RequireContract;
        template.RequirePayment = request.RequirePayment;
        template.RequireBooking = request.RequireBooking;
        template.IntakeFormConfigJson = request.IntakeFormConfigJson;
        template.ContractText = request.ContractText;
        template.PaymentAmount = request.PaymentAmount;

        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var agencyId = GetAgencyId();
        var template = await _context.Templates.FirstOrDefaultAsync(t => t.Id == id && t.AgencyId == agencyId);

        if (template == null) return NotFound();

        _context.Templates.Remove(template);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }
}
