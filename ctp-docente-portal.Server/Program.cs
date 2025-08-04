using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Mappings;
using ctp_docente_portal.Server.Services.Implementations;
using ctp_docente_portal.Server.Services.Implentations;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ctp_docente_portal.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1️⃣ Conexión a PostgreSQL
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString)
                       .LogTo(Console.WriteLine, LogLevel.Information));

            // 2️⃣ Configurar AutoMapper
            builder.Services.AddAutoMapper(typeof(MappingProfile));

            // 3️⃣ Registrar servicios
            builder.Services.AddScoped<IWhatsAppApiService, WhatsAppApiService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<IEvaluationCriteriaService, EvaluationCriteriaService>();
            builder.Services.AddScoped<ISubjectEvaluationService, SubjectEvaluationService>();
            builder.Services.AddScoped<IAttendanceService, AttendanceService>();
            builder.Services.AddScoped<INotificationService, NotificationService>();

            builder.Services.AddControllers();

            var app = builder.Build();

            // 4️⃣ Middlewares
            app.UseMiddleware<ctp_docente_portal.Server.Middlewares.RoleAuthorizationMiddleware>();

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();

            app.MapControllers();
            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
