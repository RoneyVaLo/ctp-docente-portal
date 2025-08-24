using AutoMapper;
using ctp_docente_portal.Server.Configurations;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Mappings;
using ctp_docente_portal.Server.Middleware;
using ctp_docente_portal.Server.Services.Implementations;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

namespace ctp_docente_portal.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            ServiceConfiguration.ConfigureServices(builder);
            JwtConfiguration.ConfigureJwtAuthentication(builder);

            var app = builder.Build();

            MiddlewareConfiguration.ConfigureMiddleware(app);

            app.Run();
        }
    }
}
