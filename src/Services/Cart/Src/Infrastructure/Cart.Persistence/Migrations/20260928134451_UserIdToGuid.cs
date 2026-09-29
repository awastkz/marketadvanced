using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAdvanced.Cart.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserIdToGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // применять после UserIdToGuid в Identity: Guid берём из public."Users" по старому id (LegacyId)
            migrationBuilder.AddColumn<Guid>(name: "NewUserId", schema: "cart", table: "ShoppingCart", type: "uuid", nullable: true);
            migrationBuilder.Sql(FillFromUsers("cart", "ShoppingCart"));
            migrationBuilder.DropIndex(name: "IX_ShoppingCart_UserId", schema: "cart", table: "ShoppingCart");
            migrationBuilder.DropColumn(name: "UserId", schema: "cart", table: "ShoppingCart");
            migrationBuilder.RenameColumn(name: "NewUserId", schema: "cart", table: "ShoppingCart", newName: "UserId");

            // у гостевых корзин UserId остаётся NULL, поэтому колонка nullable, а индекс с фильтром
            migrationBuilder.CreateIndex(name: "IX_ShoppingCart_UserId", schema: "cart", table: "ShoppingCart", column: "UserId",
                unique: true, filter: "\"UserId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("int -> Guid необратимо, откат только из бэкапа");
        }

        // в интеграционных тестах своя пустая база без public."Users" — там UPDATE пропускаем
        private static string FillFromUsers(string schema, string table) => $"""
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_schema = 'public' AND table_name = 'Users' AND column_name = 'LegacyId') THEN
                    UPDATE {schema}."{table}" t SET "NewUserId" = u."Id"
                    FROM public."Users" u WHERE t."UserId" = u."LegacyId";
                END IF;
            END $$;
            """;
    }
}
