using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class EvaluationScoreService : IEvaluationScoreService
    {
        private readonly AppDbContext _context;
        private readonly IStudentService _studentService;
        private readonly IEvaluationItemService _evaluationService;
        private readonly IMapper _mapper;

        public EvaluationScoreService(
            AppDbContext context,
            IStudentService studentService,
            IEvaluationItemService evaluationService,
            IMapper mapper)
        {
            _context = context;
            _studentService = studentService;
            _evaluationService = evaluationService;
            _mapper = mapper;
        }

        public async Task<List<StudentEvaluationMatrixDto>> GetStudentScoresMatrixAsync(int subjectId, int sectionId)
        {
            var studentDtos = await _studentService.GetStudentsBySectionAsync(sectionId);
            var itemDtos = await _evaluationService.GetItemsBySubjectAndSectionAsync(subjectId, sectionId);

            var itemIds = itemDtos.Select(i => i.Id).ToList();
            var studentIds = studentDtos.Select(s => s.Id).ToList();

            // 1. Scores directos
            var scores = await _context.StudentEvaluationScores
                .AsNoTracking()
                .Where(s => itemIds.Contains(s.EvaluationItemId) && studentIds.Contains(s.StudentId))
                .ToListAsync();

            var scoreDict = scores
                .GroupBy(s => s.StudentId)
                .ToDictionary(
                    g => g.Key,
                    g => g.ToDictionary(s => s.EvaluationItemId, s => s.Score)
                );

            // 2. Items con criterios
            var itemsConCriterios = itemDtos.Where(i => i.HasCriteria).Select(i => i.Id).ToList();

            if (itemsConCriterios.Any())
            {
                var criterios = await _context.EvaluationCriteria
                    .AsNoTracking()
                    .Where(c => itemsConCriterios.Contains(c.EvaluationItemId))
                    .ToListAsync();

                var criteriosScores = await _context.StudentCriteriaScores
                    .AsNoTracking()
                    .Where(s => itemsConCriterios.Contains(s.EvaluationItemId) && studentIds.Contains(s.StudentId))
                    .ToListAsync();

                // Calcular el puntaje por item a partir de los criterios
                var scorePorCriterios = criteriosScores
                    .GroupBy(s => new { s.StudentId, s.EvaluationItemId })
                    .Select(g =>
                    {
                        var criteriosItem = criterios.Where(c => c.EvaluationItemId == g.Key.EvaluationItemId).ToList();
                        decimal total = 0;

                        foreach (var cs in g)
                        {
                            var criterio = criteriosItem.FirstOrDefault(c => c.Id == cs.CriteriaId);
                            if (criterio != null)
                                total += cs.Score * (criterio.Weight / 100m); // weight como porcentaje
                        }

                        return new
                        {
                            g.Key.StudentId,
                            g.Key.EvaluationItemId,
                            TotalScore = total
                        };
                    })
                    .ToList();

                // Integrar al diccionario principal
                foreach (var sc in scorePorCriterios)
                {
                    if (!scoreDict.ContainsKey(sc.StudentId))
                        scoreDict[sc.StudentId] = new Dictionary<int, decimal>();

                    scoreDict[sc.StudentId][sc.EvaluationItemId] = sc.TotalScore;
                }
            }

            // 3. Construir matriz final
            var result = studentDtos.Select(student => new StudentEvaluationMatrixDto
            {
                StudentId = student.Id,
                StudentName = student.FullName,
                ScoresByItemId = itemDtos.ToDictionary(
                    item => item.Id,
                    item => scoreDict.ContainsKey(student.Id) && scoreDict[student.Id].ContainsKey(item.Id)
                        ? (decimal?)scoreDict[student.Id][item.Id]
                        : null
                )
            }).ToList();

            return result;
        }



        public async Task UpsertStudentScoresAsync(int sectionId, List<StudentEvaluationScoreDto> scores)
        {
            if (scores == null || scores.Count == 0)
                throw new ArgumentException("La lista de calificaciones está vacía.");

            // Obtener estudiantes válidos de la sección
            var validStudentIds = await _context.SectionStudents
                .Where(ss => ss.SectionId == sectionId && ss.isActive)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            if (!validStudentIds.Any())
                throw new ArgumentException($"No hay estudiantes activos en la sección {sectionId}.");

            // Filtrar estudiantes que pertenecen a la sección
            var filteredScores = scores.Where(s => validStudentIds.Contains(s.StudentId)).ToList();

            if (!filteredScores.Any())
                throw new ArgumentException("Ninguno de los estudiantes enviados pertenece a la sección especificada.");

            var studentIds = filteredScores.Select(s => s.StudentId).Distinct().ToList();
            var evaluationItemIds = filteredScores.Select(s => s.EvaluationItemId).Distinct().ToList();

            // 🔹 Buscar calificaciones existentes para esos estudiantes y esos ítems
            var existingScores = await _context.StudentEvaluationScores
                .Where(s => studentIds.Contains(s.StudentId) && evaluationItemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            foreach (var scoreDto in scores)
            {
                var existing = existingScores.FirstOrDefault(s =>
                    s.StudentId == scoreDto.StudentId &&
                    s.EvaluationItemId == scoreDto.EvaluationItemId);

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
                    _context.StudentEvaluationScores.Add(new StudentEvaluationScoresModel
                    {
                        StudentId = scoreDto.StudentId,
                        EvaluationItemId = scoreDto.EvaluationItemId,
                        Score = scoreDto.Score,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedBy = scoreDto.UpdatedBy,
                        UpdatedBy = scoreDto.UpdatedBy
                    });
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
