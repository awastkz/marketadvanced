using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAdvanced.Catalog.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserIdToGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // применять после UserIdToGuid в Identity: Guid берём из public."Users" по старому id (LegacyId)
            foreach (var table in new[] { "Product", "Brand", "Category", "ProductAttribute" })
            {
                migrationBuilder.AddColumn<Guid>(name: "NewUserId", schema: "catalog", table: table, type: "uuid", nullable: true);
                migrationBuilder.Sql(FillFromUsers("catalog", table));

                // строки, созданные до AddUserId, получили UserId = 0 (владельца нет) — переносим как Guid.Empty.
                // Остальные несопоставленные id не трогаем: на них AlterColumn ниже упадёт, и это правильно
                migrationBuilder.Sql($"""
                    UPDATE catalog."{table}" SET "NewUserId" = '00000000-0000-0000-0000-000000000000'
                    WHERE "UserId" = 0 AND "NewUserId" IS NULL;
                    """);
                migrationBuilder.DropIndex(name: $"IX_{table}_UserId", schema: "catalog", table: table);
                migrationBuilder.DropColumn(name: "UserId", schema: "catalog", table: table);
                migrationBuilder.RenameColumn(name: "NewUserId", schema: "catalog", table: table, newName: "UserId");
                migrationBuilder.AlterColumn<Guid>(name: "UserId", schema: "catalog", table: table, type: "uuid", nullable: false,
                    oldClrType: typeof(Guid), oldType: "uuid", oldNullable: true);
                migrationBuilder.CreateIndex(name: $"IX_{table}_UserId", schema: "catalog", table: table, column: "UserId");
            }
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
