using ctp_docente_portal.Server;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using System.Text;

namespace ctp_docente_portal.Tests.Integration
{
    public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ApiIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Endpoints_CRUD_Funcionan()
        {
            // TODO: Implementar endpoint PUT y DELETE

            // Arrange
            var nuevoItem = new
            {
                SectionAssignmentId = 10,
                Name = "Examen Final",
                Description = "Evaluación final del curso",
                CategoryId = 2,
                EvaluationCategoryName = "Formativa",
                Percentage = 30.0m,
                HasCriteria = false,
                CreatedBy = 1,
                UpdatedBy = 1
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(nuevoItem),
                Encoding.UTF8,
                "application/json");

            // Act - Insertar
            var response = await _client.PostAsync("/api/evaluationitems", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Error: {errorContent}");
            }

            // Assert - Validar creación
            response.EnsureSuccessStatusCode();

            // Extraer el ID del item creado para la consulta
            var responseContent = await response.Content.ReadAsStringAsync();
            dynamic createdItem = JsonConvert.DeserializeObject(responseContent);
            int itemId = createdItem.id;

            // Act - Consultar
            var getResponse = await _client.GetAsync($"/api/evaluationitems/{itemId}");
            var result = await getResponse.Content.ReadAsStringAsync();

            // Assert - Validar consulta
            Assert.Contains("Examen Final", result);
            Assert.Contains("Evaluación final del curso", result);
        }
    }
}
