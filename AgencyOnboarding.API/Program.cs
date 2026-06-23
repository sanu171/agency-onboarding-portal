using Microsoft.EntityFrameworkCore;
using AgencyOnboarding.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AgencyOnboarding.API.Services;
using Stripe;
using Hangfire;
using Hangfire.InMemory;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options => 
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddOpenApi();
builder.Services.AddScoped<IPdfService, PdfService>();

// Email — MockEmailService for calendar/general emails, ResendEmailService for OTP
builder.Services.AddScoped<IEmailService, MockEmailService>();
builder.Services.AddScoped<ResendEmailService>();

// Resend SDK
builder.Services.AddResend(options =>
{
    options.ApiToken = builder.Configuration["Resend:ApiKey"] ?? string.Empty;
});

// Hangfire with InMemory storage (fire-and-forget OTP emails)
builder.Services.AddHangfire(config => config.UseInMemoryStorage());
builder.Services.AddHangfireServer();

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"] ?? "sk_test_dummy";

builder.Services.AddCors(options =>
{
    var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
    options.AddPolicy("AllowFrontend",
        b => b.SetIsOriginAllowed(origin => 
                  origin == frontendUrl || 
                  origin.StartsWith("http://localhost:") || 
                  origin.EndsWith(".vercel.app"))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

string GetConnectionString()
{
    var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL")?.Trim();
    if (string.IsNullOrEmpty(dbUrl))
        return builder.Configuration.GetConnectionString("DefaultConnection")!;
        
    if (dbUrl.StartsWith("\"") && dbUrl.EndsWith("\""))
        dbUrl = dbUrl.Substring(1, dbUrl.Length - 2);
    if (dbUrl.StartsWith("'") && dbUrl.EndsWith("'"))
        dbUrl = dbUrl.Substring(1, dbUrl.Length - 2);
    
    dbUrl = dbUrl.Trim();
        
    if (!dbUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) && 
        !dbUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return dbUrl;
    }
        
    var uri = new Uri(dbUrl);
    var userInfo = uri.UserInfo.Split(':');
    var port = uri.Port > 0 ? uri.Port : 5432;
    return $"Host={uri.Host};Port={port};Database={uri.LocalPath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SslMode=Require;TrustServerCertificate=true;";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(GetConnectionString()));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AgencyOnboarding.API",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AgencyOnboarding.Frontend",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "AgencyOnboardingSuperSecretKeyForDevelopmentOnlyPleaseChangeInProduction"))
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Hangfire dashboard — accessible at /hangfire in development only
    app.UseHangfireDashboard("/hangfire");
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbInitializer.Initialize(context);
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");
