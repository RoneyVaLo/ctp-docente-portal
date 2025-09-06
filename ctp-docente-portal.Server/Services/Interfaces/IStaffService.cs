using ctp_docente_portal.Server.DTOs.Staff;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IStaffService
    {
        Task<StaffDto> GetByIdAsync(int id);
        Task<List<StaffDto>> GetAllAsync();
    }
}
