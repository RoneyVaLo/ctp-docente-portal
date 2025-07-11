using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.SubjectEvaluationItems;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implentations
{
    public class SubjectEvaluationService : ISubjectEvaluationService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public SubjectEvaluationService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<SubjectEvaluationItemDto> CreateAsync(SubjectEvaluationItemCreateDto dto)
        {
            var sectionExists = await _context.SectionAssignments.AnyAsync(sa => sa.Id == dto.SectionAssignmentId);
            if (!sectionExists)
                throw new ArgumentException("SectionAssignmentId no existe.");

            var total = await _context.SubjectEvaluationItems
                .Where(x => x.SectionAssignmentId == dto.SectionAssignmentId)
                .SumAsync(x => x.Percentage);

            if (total + dto.Percentage > 100)
                throw new InvalidOperationException("La suma total no puede superar el 100%.");

            var model = _mapper.Map<SubjectEvaluationItemsModel>(dto);
            model.CreatedAt = DateTime.UtcNow;
            model.UpdatedAt = DateTime.UtcNow;

            _context.SubjectEvaluationItems.Add(model);
            await _context.SaveChangesAsync();

            return _mapper.Map<SubjectEvaluationItemDto>(model);
        }

        public async Task<SubjectEvaluationItemDto> UpdateAsync(int id, SubjectEvaluationItemUpdateDto dto)
        {
            var model = await _context.SubjectEvaluationItems.FindAsync(id);
            if (model == null)
                throw new KeyNotFoundException("Evaluación no encontrada.");

            var total = await _context.SubjectEvaluationItems
                .Where(x => x.SectionAssignmentId == model.SectionAssignmentId && x.Id != id)
                .SumAsync(x => x.Percentage);

            if (total + dto.Percentage > 100)
                throw new InvalidOperationException("La suma total no puede superar el 100%.");

            model.Name = dto.Name;
            model.Percentage = dto.Percentage;
            model.HasCriteria = dto.HasCriteria;
            model.UpdatedAt = DateTime.UtcNow;
            model.UpdatedBy = dto.UpdatedBy;

            await _context.SaveChangesAsync();

            return _mapper.Map<SubjectEvaluationItemDto>(model);
        }

        public async Task DeleteAsync(int id)
        {
            var model = await _context.SubjectEvaluationItems.FindAsync(id);
            if (model == null)
                throw new KeyNotFoundException("Evaluación no encontrada.");

            var hasScores = await _context.StudentEvaluationScores
                .AnyAsync(s => s.EvaluationItemId == id);

            if (hasScores)
                throw new InvalidOperationException("No se puede eliminar, ya existen notas registradas.");

            _context.SubjectEvaluationItems.Remove(model);
            await _context.SaveChangesAsync();
        }

        public async Task<SubjectEvaluationItemDto> GetByIdAsync(int id)
        {
            var model = await _context.SubjectEvaluationItems.FindAsync(id);
            if (model == null)
                throw new KeyNotFoundException("Evaluación no encontrada.");

            return _mapper.Map<SubjectEvaluationItemDto>(model);
        }

        public async Task<List<SubjectEvaluationItemDto>> GetBySectionAssignmentAsync(int sectionAssignmentId)
        {
            var items = await _context.SubjectEvaluationItems
                .Where(x => x.SectionAssignmentId == sectionAssignmentId)
                .ToListAsync();

            return _mapper.Map<List<SubjectEvaluationItemDto>>(items);
        }

        public async Task<int> CreateDraftEvaluationItemAsync(EvaluationItemDraftCreateDto dto)
        {
            var draft = new SubjectEvaluationItemsModel
            {
                SectionAssignmentId = dto.SectionAssignmentId,
                Name = string.Empty,
                Percentage = 0,
                HasCriteria = false,
                IsDraft = true,
                CreatedBy = dto.CreatedBy,
                UpdatedBy = dto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SubjectEvaluationItems.Add(draft);
            await _context.SaveChangesAsync();

            return draft.Id; // Devuelve el ID que se usará para crear rúbricas
        }
    }
}
