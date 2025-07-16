using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Mappings;
using ctp_docente_portal.Server.Services.Interfaces;
using ctp_docente_portal.Server.Services.Implementations;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString)
                       .LogTo(Console.WriteLine, LogLevel.Information));

            // Configurar AutoMapper correctamente
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MappingProfile>();
            });

            var mapper = mapperConfig.CreateMapper();
            builder.Services.AddSingleton<IMapper>(mapper);

            // Servicios
            builder.Services.AddScoped<IAttendanceService, AttendanceService>();
            builder.Services.AddScoped<IWhatsAppApiService, WhatsAppApiService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<IEvaluationCriteriaService, EvaluationCriteriaService>();
            builder.Services.AddScoped<ISubjectEvaluationService, SubjectEvaluationService>();

            builder.Services.AddControllers();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseAuthorization();

            app.UseMiddleware<ctp_docente_portal.Server.Middlewares.RoleAuthorizationMiddleware>();

            app.MapControllers();
            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
