using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Mappings;
using ctp_docente_portal.Server.Middleware;
using ctp_docente_portal.Server.Services.Implementations;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

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


            builder.Services.AddControllers();

            // TODO: Así se deben añadir todas las Interfaces (INTERFACE) y sus Implementaciones (SERVICES)
            builder.Services.AddScoped<IEvaluationCategoriesService, EvaluationCategoriesService>();
            builder.Services.AddScoped<IEvaluationCriteriaService, EvaluationCriteriaService>();
            builder.Services.AddScoped<IEvaluationItemService, EvaluationItemService>();
            builder.Services.AddScoped<IAcademicPeriodService, AcademicPeriodService>();
            builder.Services.AddScoped<ISectionService, SectionService>();
            builder.Services.AddScoped<ISubjectService, SubjectService>();
            builder.Services.AddScoped<IStudentService, StudentService>();
            builder.Services.AddScoped<IEvaluationScoreService, EvaluationScoreService>();
            builder.Services.AddScoped<IStudentCriteriaScoreService, StudentCriteriaScoreService>();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Middleware to management errors
            app.UseMiddleware<ErrorHandlingMiddleware>();

            // Configure the HTTP request pipeline.

            app.UseRouting();

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
