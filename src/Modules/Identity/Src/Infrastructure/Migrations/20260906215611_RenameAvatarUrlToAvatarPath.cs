using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAdvanced.Identity.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameAvatarUrlToAvatarPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AvatarUrl",
                table: "UserProfiles",
                newName: "AvatarPath");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "AvatarPath",
                table: "UserProfiles",
                newName: "AvatarUrl");
        }
    }
}
