using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class EvaluationCriteriaService : IEvaluationCriteriaService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EvaluationCriteriaService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        private async Task<bool> EvaluationItemExistsAsync(int evaluationItemId)
        {
            return await _context.EvaluationItems.AnyAsync(e => e.Id == evaluationItemId);
        }

        private async Task<decimal> GetTotalWeightForItemAsync(int evaluationItemId, int? excludingId = null)
        {
            var query = _context.EvaluationCriteria
                .Where(e => e.EvaluationItemId == evaluationItemId);

            if (excludingId.HasValue)
            {
                query = query.Where(e => e.Id != excludingId.Value);
            }

            return await query.SumAsync(e => e.Weight);
        }

        public async Task<IEnumerable<EvaluationCriteriaDto>> CreateManyAsync(IEnumerable<EvaluationCriteriaDto> criteriaList)
        {
            int userId = 1;

            if (criteriaList == null || !criteriaList.Any())
                throw new ArgumentException("La lista de criterios no puede estar vacía.");

            var now = DateTime.UtcNow;

            var evaluationItemId = criteriaList.First().EvaluationItemId;

            if (!await EvaluationItemExistsAsync(evaluationItemId))
                throw new ArgumentException("El Item de Evaluación no existe.");

            var currentWeight = await GetTotalWeightForItemAsync(evaluationItemId);
            var newWeight = criteriaList.Sum(c => c.Weight);

            if (currentWeight + newWeight > 100)
                throw new InvalidOperationException("La suma de las rúbricas supera el 100%.");

            // ✅ Mapear DTO → Entidad
            var entities = _mapper.Map<List<EvaluationCriteriaModel>>(criteriaList);

            // Rellenar campos comunes
            foreach (var e in entities)
            {
                e.CreatedAt = now;
                e.UpdatedAt = now;
                e.CreatedBy = userId;
                e.UpdatedBy = userId;
            }

            // 4️⃣ Insertar en lote
            await _context.EvaluationCriteria.AddRangeAsync(entities);
            await _context.SaveChangesAsync();

            return _mapper.Map<List<EvaluationCriteriaDto>>(entities);
        }

        public async Task<IEnumerable<EvaluationCriteriaDto>> UpdateManyAsync(IEnumerable<EvaluationCriteriaDto> criteriaList)
        {
            int userId = 1;

            if (criteriaList == null || !criteriaList.Any())
                throw new ArgumentException("La lista de criterios no puede estar vacía.");

            var now = DateTime.UtcNow;
            var ids = criteriaList.Select(c => c.Id).ToList();

            // Obtener entidades existentes
            var existingEntities = await _context.EvaluationCriteria
                .Where(ec => ids.Contains(ec.Id))
                .ToListAsync();

            if (existingEntities.Count != ids.Count)
                throw new ArgumentException("Uno o más criterios no existen en la base de datos.");

            var evaluationItemId = criteriaList.First().EvaluationItemId;

            // Validar peso total
            var currentWeight = await _context.EvaluationCriteria
                .Where(ec => ec.EvaluationItemId == evaluationItemId)
                .SumAsync(ec => ec.Weight);

            decimal adjustedWeight = currentWeight;

            foreach (var entity in existingEntities)
            {
                var dto = criteriaList.First(c => c.Id == entity.Id);

                // Si cambia el peso, ajustar el total
                if (entity.Weight != dto.Weight)
                {
                    adjustedWeight -= entity.Weight; // quitar peso viejo
                    adjustedWeight += dto.Weight;    // sumar peso nuevo
                }
            }

            if (adjustedWeight > 100)
                throw new InvalidOperationException("La suma de las rúbricas supera el 100%.");

            // Actualizar solo si hay cambios
            foreach (var entity in existingEntities)
            {
                var dto = criteriaList.First(c => c.Id == entity.Id);

                bool hasChanges = false;

                if (entity.Name != dto.Name)
                {
                    entity.Name = dto.Name;
                    hasChanges = true;
                }

                if (entity.Weight != dto.Weight)
                {
                    entity.Weight = dto.Weight;
                    hasChanges = true;
                }

                if (hasChanges)
                {
                    entity.UpdatedAt = now;
                    entity.UpdatedBy = userId;
                }
            }

            // Guardar solo si hubo cambios
            await _context.SaveChangesAsync();

            // Mapear a DTO de respuesta
            return _mapper.Map<List<EvaluationCriteriaDto>>(existingEntities);
        }


        public async Task DeleteAsync(int id)
        {
            var model = await _context.EvaluationCriteria.FindAsync(id);
            if (model == null)
                throw new KeyNotFoundException("Criterio no encontrado.");

            bool hasScores = await _context.StudentCriteriaScores
                .AnyAsync(s => s.CriteriaId == id);

            if (hasScores)
                throw new InvalidOperationException("No se puede eliminar un criterio con notas asignadas.");

            _context.EvaluationCriteria.Remove(model);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAllByItemIdAsync(int evaluationItemId)
        {
            var criteriaList = await _context.EvaluationCriteria
                .Where(c => c.EvaluationItemId == evaluationItemId)
                .ToListAsync();

            if (!criteriaList.Any())
                return;

            // Verificar si alguno tiene notas
            var hasScores = await _context.StudentCriteriaScores
                .AnyAsync(s => criteriaList.Select(c => c.Id).Contains(s.CriteriaId));

            if (hasScores)
                throw new InvalidOperationException("No se pueden eliminar criterios porque uno o más tienen notas asignadas.");

            _context.EvaluationCriteria.RemoveRange(criteriaList);
            await _context.SaveChangesAsync();
        }

        public async Task<List<EvaluationCriteriaDto>> GetByEvaluationItemIdAsync(int evaluationItemId)
        {
            var result = await _context.EvaluationCriteria
                .Where(e => e.EvaluationItemId == evaluationItemId)
                .ToListAsync();

            return _mapper.Map<List<EvaluationCriteriaDto>>(result);
        }

        public async Task<EvaluationCriteriaDto> GetByIdAsync(int id)
        {
            var model = await _context.EvaluationCriteria.FirstOrDefaultAsync(e => e.Id == id);
            if (model == null)
                throw new KeyNotFoundException("Criterio no encontrado.");

            return _mapper.Map<EvaluationCriteriaDto>(model);
        }
    }
}
