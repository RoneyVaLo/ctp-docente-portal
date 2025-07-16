using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task CreateAsync(CreateAttendanceDto dto);
        Task CreateGroupAttendanceAsync(CreateGroupAttendanceDto dto);
        Task UpdateAsync(UpdateAttendanceDto dto);
        Task<List<Attendance>> GetAsync(AttendanceQueryDto filter);
        Task<List<AttendanceSummaryDto>> GetSummaryByGroupAsync(int sectionId);
    }
}
