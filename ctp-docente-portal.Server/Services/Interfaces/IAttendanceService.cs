using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task CreateGroupAttendanceAsync(CreateGroupAttendanceDto dto);
        Task UpdateAsync(UpdateAttendanceDto dto);
        Task<List<Attendance>> GetAsync(AttendanceQueryDto filter);
        Task<List<AttendanceSummaryDto>> GetSummaryByGroupAsync(int sectionId);
    }
}
