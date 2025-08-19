using ctp_docente_portal.Server.DTOs.AcademicPeriod;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IAcademicPeriodService
    {
        Task<IEnumerable<AcademicPeriodDto>> GetAllAsync();
        Task<AcademicPeriodDto> GetByIdAsync(int id);
        Task<AcademicPeriodDto> CreateAsync(AcademicPeriodDto dto, int userId);
        Task<AcademicPeriodDto> UpdateAsync(int id, AcademicPeriodDto dto, int userId);
        Task<bool> DeleteAsync(int id);
    }
}
