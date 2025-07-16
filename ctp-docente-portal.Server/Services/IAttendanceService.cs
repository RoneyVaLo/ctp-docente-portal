using ctp_docente_portal.Server.DTOs.Attendance;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task CreateAsync(CreateAttendanceDto dto);
    }
}
