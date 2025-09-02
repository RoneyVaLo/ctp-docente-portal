using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.StudentCriteriaScores;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class StudentCriteriaScoreService : IStudentCriteriaScoreService
    {
        private readonly AppDbContext _dbContext;

        public StudentCriteriaScoreService(AppDbContext context)
        {
            _dbContext = context;
        }

        public async Task UpsertStudentCriteriaScoresAsync(int sectionId, List<StudentCriteriaScoresDto> scores)
        {
            if (scores == null || scores.Count == 0)
                throw new ArgumentException("La lista de calificaciones de criterios está vacía.");

            // 🔹 Obtener estudiantes válidos en la sección
            var validStudentIds = await _dbContext.SectionStudent
                .Where(ss => ss.SectionId == sectionId && ss.IsActive)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            if (!validStudentIds.Any())
                throw new ArgumentException($"No hay estudiantes activos en la sección {sectionId}.");

            // 🔹 Filtrar solo los que pertenecen a la sección
            var filteredScores = scores.Where(s => validStudentIds.Contains(s.StudentId)).ToList();

            if (!filteredScores.Any())
                throw new ArgumentException("Ninguno de los estudiantes enviados pertenece a la sección especificada.");

            var studentIds = filteredScores.Select(s => s.StudentId).Distinct().ToList();
            var evaluationItemIds = filteredScores.Select(s => s.EvaluationItemId).Distinct().ToList();
            var criteriaIds = filteredScores.Select(s => s.CriteriaId).Distinct().ToList();

            // 🔹 Obtener los registros existentes
            var existingScores = await _dbContext.StudentCriteriaScores
                .Where(s => studentIds.Contains(s.StudentId)
                         && evaluationItemIds.Contains(s.EvaluationItemId)
                         && criteriaIds.Contains(s.CriteriaId))
                .ToListAsync();

            foreach (var scoreDto in filteredScores)
            {
                var existing = existingScores.FirstOrDefault(s =>
                    s.StudentId == scoreDto.StudentId &&
                    s.EvaluationItemId == scoreDto.EvaluationItemId &&
                    s.CriteriaId == scoreDto.CriteriaId);

                if (existing != null)
                {
                    // Update
                    if (existing.Score != scoreDto.Score)
                    {
                        existing.Score = scoreDto.Score;
                        existing.UpdatedAt = DateTime.UtcNow;
                        existing.UpdatedBy = scoreDto.UpdatedBy;
                    }
                }
                else
                {
                    // Insert
                    _dbContext.StudentCriteriaScores.Add(new StudentCriteriaScoresModel
                    {
                        StudentId = scoreDto.StudentId,
                        EvaluationItemId = scoreDto.EvaluationItemId,
                        CriteriaId = scoreDto.CriteriaId,
                        Score = scoreDto.Score,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedBy = scoreDto.UpdatedBy,
                        UpdatedBy = scoreDto.UpdatedBy
                    });
                }
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}
