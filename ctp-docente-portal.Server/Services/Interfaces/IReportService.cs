using ctp_docente_portal.Server.DTOs.Reports;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<GradeDto>> GetGradesAsync(int userId, ReportFilterDto filter);
        Task<List<AttendanceDto>> GetAttendanceAsync(int userId, ReportFilterDto filter);
        Task<List<GroupReportDto>> GetGroupReportAsync(int userId, ReportFilterDto filter);
        Task<GeneralStatsDto> GetGeneralStatsAsync(int userId, ReportFilterDto filter);
    }
}