using Microsoft.EntityFrameworkCore;

namespace AgencyOnboarding.API.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Agency> Agencies { get; set; }
    public DbSet<Template> Templates { get; set; }
    public DbSet<OnboardingSession> OnboardingSessions { get; set; }
    public DbSet<IntakeForm> IntakeForms { get; set; }
    public DbSet<UploadedFile> UploadedFiles { get; set; }
    public DbSet<ContractSignature> ContractSignatures { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Agency>()
            .HasIndex(a => a.Email)
            .IsUnique();

        modelBuilder.Entity<OnboardingSession>()
            .HasIndex(s => s.Token)
            .IsUnique();

        modelBuilder.Entity<OnboardingSession>()
            .HasOne(s => s.IntakeForm)
            .WithOne(i => i.Session)
            .HasForeignKey<IntakeForm>(i => i.OnboardingSessionId);

        modelBuilder.Entity<OnboardingSession>()
            .HasOne(s => s.ContractSignature)
            .WithOne(c => c.Session)
            .HasForeignKey<ContractSignature>(c => c.OnboardingSessionId);

        modelBuilder.Entity<OnboardingSession>()
            .HasOne(s => s.Payment)
            .WithOne(p => p.Session)
            .HasForeignKey<Payment>(p => p.OnboardingSessionId);

        modelBuilder.Entity<OnboardingSession>()
            .HasOne(s => s.Booking)
            .WithOne(b => b.Session)
            .HasForeignKey<Booking>(b => b.OnboardingSessionId);
    }
}
