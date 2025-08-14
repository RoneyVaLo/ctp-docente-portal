using System.Text.Json;

namespace ctp_docente_portal.Server.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = StatusCodes.Status500InternalServerError;
            var message = "Ocurrió un error inesperado.";

            // TODO: Buscar y Añadir más excepciones que pueden aparecer
            switch (exception)
            {
                case KeyNotFoundException knf:
                    statusCode = StatusCodes.Status404NotFound;
                    message = knf.Message;
                    break;

                case ArgumentException arg:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = arg.Message;
                    break;

                case UnauthorizedAccessException unauthorized:
                    statusCode = StatusCodes.Status401Unauthorized;
                    message = unauthorized.Message;
                    break;
                
                case InvalidOperationException invalidOperationException:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = invalidOperationException.Message;
                    break;

                default:
                    Console.WriteLine("Excepción no manejada");
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var options = new JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var response = new
            {
                StatusCode = statusCode,
                Message = message
            };

            var json = JsonSerializer.Serialize(response, options);
            await context.Response.WriteAsync(json);
        }
    }
}
