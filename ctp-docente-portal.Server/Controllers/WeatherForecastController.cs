using Microsoft.AspNetCore.Mvc;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.Helpers;



namespace ctp_docente_portal.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }

        // ? M�todo completo para evitar errores de compilaci�n
        [HttpGet("grades/pdf")]
        [ctp_docente_portal.Server.Middlewares.RequiredRole("Administrativo")]
        public async Task<IActionResult> ExportGradesPdf()
        {
            // Por ahora solo devolvemos un mensaje simulado
            await Task.Delay(100); // Simula proceso as�ncrono

            return Ok(new { message = "Generaci�n de PDF en construcci�n." });
        }
    }
}
