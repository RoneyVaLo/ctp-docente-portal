using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Tests.Integration
{
    public class DatabaseIntegrationTests
    {
        private readonly AppDbContext _context;

        public DatabaseIntegrationTests()
        {
            var connectionString = "";
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(connectionString)
                .Options;

            _context = new AppDbContext(options);
        }

        [Fact]
        public async Task Puede_Insertar_Leer_Actualizar_Eliminar()
        {
            // Insertar
            var evaluationItem = new EvaluationItemsModel
            {
                SectionAssignmentId = 7,
                Description = "Evaluación de conocimientos básicos",
                CategoryId = 2,
                Name = "Evaluacion de Prueba",
                Percentage = 30.0m,
                HasCriteria = false,
                IsDraft = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = 1,
                UpdatedBy = 1 
            };
            _context.EvaluationItems.Add(evaluationItem);
            await _context.SaveChangesAsync();

            // Leer
            var encontrado = await _context.EvaluationItems.FirstOrDefaultAsync(e => e.Id == evaluationItem.Id);
            Assert.NotNull(encontrado);

            // Actualizar
            encontrado.Name = "Examen Parcial I";
            await _context.SaveChangesAsync();

            var actualizado = await _context.EvaluationItems.FirstOrDefaultAsync(e => e.Id == evaluationItem.Id);
            Assert.NotNull(actualizado);

            // Eliminar
            _context.EvaluationItems.Remove(actualizado);
            await _context.SaveChangesAsync();

            var eliminado = await _context.EvaluationItems.FirstOrDefaultAsync(e => e.Id == evaluationItem.Id);
            Assert.Null(eliminado);
        }
    }
}
