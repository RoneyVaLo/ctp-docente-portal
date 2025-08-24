using ctp_docente_portal.Server.Middleware;

namespace ctp_docente_portal.Server.Configurations
{
    public static class MiddlewareConfiguration
    {
        public static void ConfigureMiddleware(WebApplication app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseMiddleware<ErrorHandlingMiddleware>();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapFallbackToFile("/index.html");
        }
    }
}
