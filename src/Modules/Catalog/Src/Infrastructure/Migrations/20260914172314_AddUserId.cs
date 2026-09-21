using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAdvanced.Catalog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                schema: "catalog",
                table: "ProductAttribute",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                schema: "catalog",
                table: "Product",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                schema: "catalog",
                table: "Category",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                schema: "catalog",
                table: "Brand",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttribute_UserId",
                schema: "catalog",
                table: "ProductAttribute",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Product_UserId",
                schema: "catalog",
                table: "Product",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Category_UserId",
                schema: "catalog",
                table: "Category",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Brand_UserId",
                schema: "catalog",
                table: "Brand",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductAttribute_UserId",
                schema: "catalog",
                table: "ProductAttribute");

            migrationBuilder.DropIndex(
                name: "IX_Product_UserId",
                schema: "catalog",
                table: "Product");

            migrationBuilder.DropIndex(
                name: "IX_Category_UserId",
                schema: "catalog",
                table: "Category");

            migrationBuilder.DropIndex(
                name: "IX_Brand_UserId",
                schema: "catalog",
                table: "Brand");

            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "catalog",
                table: "ProductAttribute");

            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "catalog",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "catalog",
                table: "Category");

            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "catalog",
                table: "Brand");
        }
    }
}
