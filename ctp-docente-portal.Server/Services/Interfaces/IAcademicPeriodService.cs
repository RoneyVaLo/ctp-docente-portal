using ctp_docente_portal.Server.DTOs.AcademicPeriod;
using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IAcademicPeriodService
    {
        Task<IEnumerable<AcademicPeriodDto>> GetAllAsync();
        Task<PagedResult<AcademicPeriodDto>> GetAllWithPaginationAsync(PaginationParams paginationParams);
        Task<AcademicPeriodDto> GetByIdAsync(int id);
        Task<AcademicPeriodDto> CreateAsync(CreateAcademicPeriodDto dto, int userId);
        Task<AcademicPeriodDto> UpdateAsync(int id, UpdateAcademicPeriodDto dto, int userId);
        Task<bool> DeleteAsync(int id);
    }
}
