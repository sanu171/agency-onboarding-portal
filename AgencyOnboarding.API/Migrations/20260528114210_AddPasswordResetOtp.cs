using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgencyOnboarding.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetOtp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordResetOtpHash",
                table: "Agencies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetOtpExpiry",
                table: "Agencies",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetOtpHash",
                table: "Agencies");

            migrationBuilder.DropColumn(
                name: "PasswordResetOtpExpiry",
                table: "Agencies");
        }
    }
}
