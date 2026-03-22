using AgencyOnboarding.API.Models;
using System.Linq;

namespace AgencyOnboarding.API.Models
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            // Look for any agencies.
            if (context.Agencies.Any())
            {
                return;   // DB has been seeded
            }

            var passHash = BCrypt.Net.BCrypt.HashPassword("123");
            
            var agency = new Agency
            {
                Name = "Acme Web Design",
                Email = "admin@acme.com",
                PasswordHash = passHash,
                BrandColor = "#2563eb",
                LogoUrl = "https://ui-avatars.com/api/?name=Acme+Web&background=2563eb&color=fff"
            };
            
            context.Agencies.Add(agency);
            context.SaveChanges();

            var template = new Template
            {
                AgencyId = agency.Id,
                Name = "Standard Web Build Onboarding",
                RequireIntake = true,
                RequireFileUpload = true,
                RequireContract = true,
                ContractText = "Standard Master Service Agreement.\n\nBy typing your electronic signature below, you are agreeing to the terms and conditions set forth by Acme Web Design, including our payment schedule, deliverables timeline, and mutual non-disclosure policies.",
                RequirePayment = true,
                PaymentAmount = 1500.00m,
                RequireBooking = true,
                IntakeFormConfigJson = "{}"
            };
            
            context.Templates.Add(template);
            context.SaveChanges();
        }
    }
}
