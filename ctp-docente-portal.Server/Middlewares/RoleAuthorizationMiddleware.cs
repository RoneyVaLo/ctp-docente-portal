namespace ctp_docente_portal.Server.Middlewares
{
    public class RoleAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;

        public RoleAuthorizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            var requiredRole = endpoint?.Metadata.GetMetadata<RequiredRoleAttribute>()?.Role;

            if (!string.IsNullOrEmpty(requiredRole))
            {
                // Leer el rol desde el header simulado
                var userRole = context.Request.Headers["x-user-role"].ToString();

                if (!string.Equals(userRole, requiredRole, StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Acceso restringido: se requiere el rol " + requiredRole);
                    return;
                }
            }

            await _next(context);
        }
    }

    // Atributo decorador
    [AttributeUsage(AttributeTargets.Method)]
    public class RequiredRoleAttribute : Attribute
    {
        public string Role { get; }
        public RequiredRoleAttribute(string role)
        {
            Role = role;
        }
    }
}
