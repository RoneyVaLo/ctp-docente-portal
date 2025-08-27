using ctp_docente_portal.Server.Configurations;
using ctp_docente_portal.Server.Services.Implementations;


namespace ctp_docente_portal.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.Configure<WhatsAppApiSettings>(
            builder.Configuration.GetSection("WhatsApp"));

            ServiceConfiguration.ConfigureServices(builder);
            JwtConfiguration.ConfigureJwtAuthentication(builder);

            var app = builder.Build();

            MiddlewareConfiguration.ConfigureMiddleware(app);

            app.Run();
        }
    }
}
