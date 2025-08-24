using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ctp_docente_portal.Server.Migrations
{
    /// <inheritdoc />
    public partial class AuthModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EvaluationRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationStaffRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StaffId = table.Column<int>(type: "integer", nullable: false),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationStaffRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StaffUserLinks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StaffId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffUserLinks", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentCriteriaScores_StudentId_EvaluationItemId_CriteriaId",
                table: "StudentCriteriaScores",
                columns: new[] { "StudentId", "EvaluationItemId", "CriteriaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationStaffRoles_StaffId_RoleId",
                table: "EvaluationStaffRoles",
                columns: new[] { "StaffId", "RoleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StaffUserLinks_StaffId_UserId",
                table: "StaffUserLinks",
                columns: new[] { "StaffId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EvaluationRoles");

            migrationBuilder.DropTable(
                name: "EvaluationStaffRoles");

            migrationBuilder.DropTable(
                name: "StaffUserLinks");

            migrationBuilder.DropIndex(
                name: "IX_StudentCriteriaScores_StudentId_EvaluationItemId_CriteriaId",
                table: "StudentCriteriaScores");
        }
    }
}
