namespace ctp_docente_portal.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddScoped<IWhatsAppApiService, WhatsAppApiService>();


            builder.Services.AddControllers();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");
            builder.Services.AddScoped<IAttendanceService, AttendanceService>();

            app.Run();
        }
    }
}
