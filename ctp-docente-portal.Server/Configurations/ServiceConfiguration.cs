using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Mappings;
using ctp_docente_portal.Server.Services.Implementations;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace ctp_docente_portal.Server.Configurations
{
    /// <summary>
    /// Static class responsible for configuring application services.
    /// </summary>
    public static class ServiceConfiguration
    {
        /// <summary>
        /// Registers services and dependencies used by the application.
        /// </summary>
        /// <param name="builder">An instance of <see cref="WebApplicationBuilder"/> used to register services.</param>
        public static void ConfigureServices(WebApplicationBuilder builder)
        {
            var configuration = builder.Configuration;

            // DbContext PostgreSQL
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString)
                       .LogTo(Console.WriteLine, LogLevel.Information));

            // AutoMapper
            builder.Services.AddSingleton(CreateMapper());

            // Registrar servicios
            RegisterAppServices(builder.Services);

            // Controladores
            builder.Services.AddControllers();

            // Autorización
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("DocenteOnly", policy => policy.RequireRole("Docente"));
                options.AddPolicy("AdministrativoOnly", policy => policy.RequireRole("Administrativo"));
            });
        }

        /// <summary>
        /// Creates and configures an instance of <see cref="IMapper"/>.
        /// </summary>
        /// <returns>A configured <see cref="IMapper"/> instance.</returns>
        private static IMapper CreateMapper()
        {
            var configExpr = new MapperConfigurationExpression();
            configExpr.AddProfile<MappingProfile>();

            var mapperConfig = new MapperConfiguration(configExpr, NullLoggerFactory.Instance);
            return mapperConfig.CreateMapper();
        }

        /// <summary>
        /// Registers the application's custom services in the dependency injection container.
        /// </summary>
        /// <param name="services">The service collection to which the custom services will be added.</param>
        private static void RegisterAppServices(IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IEvaluationCategoriesService, EvaluationCategoriesService>();
            services.AddScoped<IEvaluationCriteriaService, EvaluationCriteriaService>();
            services.AddScoped<IEvaluationItemService, EvaluationItemService>();
            services.AddScoped<IAcademicPeriodService, AcademicPeriodService>();
            services.AddScoped<ISectionService, SectionService>();
            services.AddScoped<ISubjectService, SubjectService>();
            services.AddScoped<IStudentService, StudentService>();
            services.AddScoped<IEvaluationScoreService, EvaluationScoreService>();
            services.AddScoped<IStudentCriteriaScoreService, StudentCriteriaScoreService>();
            services.AddScoped<IUserService, UserService>();
        }
    }
}
