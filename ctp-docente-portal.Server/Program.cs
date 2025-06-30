using ctp_docente_portal.Server.Data;
using Microsoft.EntityFrameworkCore;

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

            // Add services to the container.

            builder.Services.AddControllers();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.

            app.UseRouting();

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
