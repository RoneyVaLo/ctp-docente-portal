using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implentations
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
            return await _context.SubjectEvaluationItems.AnyAsync(e => e.Id == evaluationItemId);
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

        public async Task<EvaluationCriteriaDto> CreateAsync(EvaluationCriteriaCreateDto dto)
        {
            if (!await EvaluationItemExistsAsync(dto.EvaluationItemId))
                throw new ArgumentException("El EvaluationItemId no existe.");

            var totalWeight = await GetTotalWeightForItemAsync(dto.EvaluationItemId);
            if (totalWeight + dto.Weight > 100)
                throw new InvalidOperationException("La suma de las rúbricas supera el 100%.");

            var model = _mapper.Map<EvaluationCriteriaModel>(dto);
            model.CreatedAt = DateTime.UtcNow;
            model.UpdatedAt = DateTime.UtcNow;

            _context.EvaluationCriteria.Add(model);
            await _context.SaveChangesAsync();

            return _mapper.Map<EvaluationCriteriaDto>(model);
        }

        public async Task<EvaluationCriteriaDto> UpdateAsync(int id, EvaluationCriteriaUpdateDto dto)
        {
            var model = await _context.EvaluationCriteria.FindAsync(id);
            if (model == null)
                throw new KeyNotFoundException("Criterio no encontrado.");

            if (!await EvaluationItemExistsAsync(dto.EvaluationItemId))
                throw new ArgumentException("El EvaluationItemId no existe.");

            var totalWeight = await GetTotalWeightForItemAsync(dto.EvaluationItemId, id);
            if (totalWeight + dto.Weight > 100)
                throw new InvalidOperationException("La suma de las rúbricas supera el 100%.");

            model.Name = dto.Name;
            model.Weight = dto.Weight;
            model.UpdatedAt = DateTime.UtcNow;
            // TODO: Ver cómo obtengo el id del usuario o si esto funciona
            model.UpdatedBy = dto.UpdatedBy;

            await _context.SaveChangesAsync();

            return _mapper.Map<EvaluationCriteriaDto>(model);
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
