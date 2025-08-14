using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.EvaluationCategories;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class EvaluationCategoriesService : IEvaluationCategoriesService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EvaluationCategoriesService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<EvaluationCategoryDto>> GetCategoriesAsync()
        {
            var result = await _context.EvaluationCategories
                .AsNoTracking()
                .ToListAsync();

            return _mapper.Map<List<EvaluationCategoryDto>>(result);
        }

        public async Task<EvaluationCategoryDto> GetCategoryByIdAsync(int id)
        {
            var model = await _context.EvaluationCategories.FirstOrDefaultAsync(ec => ec.Id == id);
            if (model == null)
                throw new KeyNotFoundException("Categoria de Evaluación no encontrado.");

            return _mapper.Map<EvaluationCategoryDto>(model);
        }
    }
}
