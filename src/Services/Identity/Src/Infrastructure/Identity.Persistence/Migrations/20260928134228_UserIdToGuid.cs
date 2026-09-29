using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAdvanced.Identity.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserIdToGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // int нельзя привести к uuid: кладём новую колонку рядом, заполняем и меняем местами

            // 1. новые колонки; gen_random_uuid() сразу выдаёт Guid всем существующим пользователям
            migrationBuilder.AddColumn<Guid>(name: "NewId", table: "Users", type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()");
            migrationBuilder.AddColumn<Guid>(name: "NewUserId", table: "UserProfiles", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "NewUserId", table: "RefreshToken", type: "uuid", nullable: true);

            // 2. проставляем ссылки на новый id
            migrationBuilder.Sql("""
                UPDATE "UserProfiles" p SET "NewUserId" = u."NewId" FROM "Users" u WHERE p."UserId" = u."Id";
                UPDATE "RefreshToken" t SET "NewUserId" = u."NewId" FROM "Users" u WHERE t."UserId" = u."Id";
                """);

            // 3. снимаем старые связи
            migrationBuilder.DropForeignKey(name: "FK_UserProfiles_Users_UserId", table: "UserProfiles");
            migrationBuilder.DropForeignKey(name: "FK_RefreshToken_Users_UserId", table: "RefreshToken");
            migrationBuilder.DropIndex(name: "IX_UserProfiles_UserId", table: "UserProfiles");
            migrationBuilder.DropIndex(name: "IX_RefreshToken_UserId", table: "RefreshToken");
            migrationBuilder.DropPrimaryKey(name: "PK_Users", table: "Users");

            // 4. меняем колонки местами
            foreach (var table in new[] { "UserProfiles", "RefreshToken" })
            {
                migrationBuilder.DropColumn(name: "UserId", table: table);
                migrationBuilder.RenameColumn(name: "NewUserId", table: table, newName: "UserId");
                migrationBuilder.AlterColumn<Guid>(name: "UserId", table: table, type: "uuid", nullable: false,
                    oldClrType: typeof(Guid), oldType: "uuid", oldNullable: true);
            }

            // старый int нужен миграциям Catalog и Cart, удалим после переноса пользователей в Keycloak
            migrationBuilder.RenameColumn(name: "Id", table: "Users", newName: "LegacyId");
            migrationBuilder.RenameColumn(name: "NewId", table: "Users", newName: "Id");
            migrationBuilder.AlterColumn<Guid>(name: "Id", table: "Users", type: "uuid", nullable: false,
                oldClrType: typeof(Guid), oldType: "uuid", oldDefaultValueSql: "gen_random_uuid()");

            // 5. возвращаем ключ, индексы и связи
            migrationBuilder.AddPrimaryKey(name: "PK_Users", table: "Users", column: "Id");
            migrationBuilder.CreateIndex(name: "IX_UserProfiles_UserId", table: "UserProfiles", column: "UserId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_RefreshToken_UserId", table: "RefreshToken", column: "UserId");
            migrationBuilder.AddForeignKey(name: "FK_UserProfiles_Users_UserId", table: "UserProfiles", column: "UserId",
                principalTable: "Users", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(name: "FK_RefreshToken_Users_UserId", table: "RefreshToken", column: "UserId",
                principalTable: "Users", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("int -> Guid необратимо, откат только из бэкапа");
        }
    }
}
