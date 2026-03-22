using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AgencyOnboarding.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Agencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    BrandColor = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Templates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AgencyId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    RequireIntake = table.Column<bool>(type: "boolean", nullable: false),
                    RequireFileUpload = table.Column<bool>(type: "boolean", nullable: false),
                    RequireContract = table.Column<bool>(type: "boolean", nullable: false),
                    RequirePayment = table.Column<bool>(type: "boolean", nullable: false),
                    RequireBooking = table.Column<bool>(type: "boolean", nullable: false),
                    IntakeFormConfigJson = table.Column<string>(type: "text", nullable: true),
                    ContractText = table.Column<string>(type: "text", nullable: true),
                    PaymentAmount = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Templates_Agencies_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "Agencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AgencyId = table.Column<int>(type: "integer", nullable: false),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ClientName = table.Column<string>(type: "text", nullable: false),
                    ClientEmail = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentStep = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingSessions_Agencies_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "Agencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OnboardingSessions_Templates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "Templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OnboardingSessionId = table.Column<int>(type: "integer", nullable: false),
                    ScheduledCallAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MeetingLink = table.Column<string>(type: "text", nullable: true),
                    BookedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_OnboardingSessions_OnboardingSessionId",
                        column: x => x.OnboardingSessionId,
                        principalTable: "OnboardingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractSignatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OnboardingSessionId = table.Column<int>(type: "integer", nullable: false),
                    SignatureDataUrl = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    SignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractSignatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractSignatures_OnboardingSessions_OnboardingSessionId",
                        column: x => x.OnboardingSessionId,
                        principalTable: "OnboardingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IntakeForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OnboardingSessionId = table.Column<int>(type: "integer", nullable: false),
                    SubmittedDataJson = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntakeForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntakeForms_OnboardingSessions_OnboardingSessionId",
                        column: x => x.OnboardingSessionId,
                        principalTable: "OnboardingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OnboardingSessionId = table.Column<int>(type: "integer", nullable: false),
                    StripePaymentIntentId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_OnboardingSessions_OnboardingSessionId",
                        column: x => x.OnboardingSessionId,
                        principalTable: "OnboardingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UploadedFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OnboardingSessionId = table.Column<int>(type: "integer", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UploadedFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UploadedFiles_OnboardingSessions_OnboardingSessionId",
                        column: x => x.OnboardingSessionId,
                        principalTable: "OnboardingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agencies_Email",
                table: "Agencies",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_OnboardingSessionId",
                table: "Bookings",
                column: "OnboardingSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractSignatures_OnboardingSessionId",
                table: "ContractSignatures",
                column: "OnboardingSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IntakeForms_OnboardingSessionId",
                table: "IntakeForms",
                column: "OnboardingSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingSessions_AgencyId",
                table: "OnboardingSessions",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingSessions_TemplateId",
                table: "OnboardingSessions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingSessions_Token",
                table: "OnboardingSessions",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_OnboardingSessionId",
                table: "Payments",
                column: "OnboardingSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Templates_AgencyId",
                table: "Templates",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedFiles_OnboardingSessionId",
                table: "UploadedFiles",
                column: "OnboardingSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "ContractSignatures");

            migrationBuilder.DropTable(
                name: "IntakeForms");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "UploadedFiles");

            migrationBuilder.DropTable(
                name: "OnboardingSessions");

            migrationBuilder.DropTable(
                name: "Templates");

            migrationBuilder.DropTable(
                name: "Agencies");
        }
    }
}
