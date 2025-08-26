using ctp_docente_portal.Server.Middleware;

namespace ctp_docente_portal.Server.Configurations
{
    /// <summary>
    /// Static class responsible for configuring the middleware pipeline of the application.
    /// </summary>
    public static class MiddlewareConfiguration
    {
        /// <summary>
        /// Configures the middleware components used by the application.
        /// </summary>
        /// <param name="app">An instance of <see cref="WebApplication"/> used to configure the middleware pipeline.</param>
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
