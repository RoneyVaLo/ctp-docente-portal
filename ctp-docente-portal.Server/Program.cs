using Microsoft.Extensions.Logging.Abstractions;
using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Mappings;
using Microsoft.EntityFrameworkCore;
using ctp_docente_portal.Server.Services.Interfaces;
using ctp_docente_portal.Server.Services.Implentations;

namespace ctp_docente_portal.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add DbContext with PostgreSQL

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString)
                .LogTo(Console.WriteLine, LogLevel.Information));

            // 1) Crea la expresión
            var configExpr = new MapperConfigurationExpression();
            configExpr.AddProfile<MappingProfile>();

            // 2) Pasa un ILoggerFactory (aquí usamos NullLoggerFactory para no depender del logging real)
            var mapperConfig = new MapperConfiguration(
                configExpr,
                NullLoggerFactory.Instance
            );

            // 3) Crea el IMapper y regístralo
            var mapper = mapperConfig.CreateMapper();
            builder.Services.AddSingleton<IMapper>(mapper);


            // Add services to the container.
            builder.Services.AddScoped<IWhatsAppApiService, WhatsAppApiService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            app.UseMiddleware<ctp_docente_portal.Server.Middlewares.RoleAuthorizationMiddleware>();




            builder.Services.AddControllers();

            // TODO: Así se deben añadir todas las Interfaces (INTERFACE) y sus Implementaciones (SERVICES)
            builder.Services.AddScoped<IEvaluationCriteriaService, EvaluationCriteriaService>();
            builder.Services.AddScoped<ISubjectEvaluationService, SubjectEvaluationService>();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.

            app.UseRouting();

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");
            builder.Services.AddScoped<IAttendanceService, AttendanceService>();

            app.Run();
        }
    }
}
