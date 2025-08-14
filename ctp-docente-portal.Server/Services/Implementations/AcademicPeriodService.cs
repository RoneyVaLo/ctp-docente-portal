using AutoMapper;
using AutoMapper.QueryableExtensions;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.AcademicPeriod;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class AcademicPeriodService : IAcademicPeriodService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AcademicPeriodService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AcademicPeriodDto>> GetAllAsync()
        {

            return await _context.AcademicPeriods
                    .AsNoTracking()
                    .OrderBy(x => x.StartDate)
                    .ProjectTo<AcademicPeriodDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();
        }

        public async Task<AcademicPeriodDto> GetByIdAsync(int id)
        {
            // TODO: Optimizar
            var entity = await _context.AcademicPeriods.FindAsync(id);
            return entity == null ? null : _mapper.Map<AcademicPeriodDto>(entity);
        }

        public async Task<AcademicPeriodDto> CreateAsync(AcademicPeriodDto dto, int userId)
        {
            var entity = _mapper.Map<AcademicPeriodsModel>(dto);
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.CreatedBy = userId;
            entity.UpdatedBy = userId;

            _context.AcademicPeriods.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<AcademicPeriodDto>(entity);
        }

        public async Task<AcademicPeriodDto> UpdateAsync(int id, AcademicPeriodDto dto, int userId)
        {
            var entity = await _context.AcademicPeriods.FindAsync(id);
            if (entity == null) return null;

            _mapper.Map(dto, entity); // Actualiza campos permitidos
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = userId;

            await _context.SaveChangesAsync();
            return _mapper.Map<AcademicPeriodDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.AcademicPeriods.FindAsync(id);
            if (entity == null) return false;

            _context.AcademicPeriods.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
