using ctp_docente_portal.Server.DTOs.Reports;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<GradeDto>> GetGradesAsync(ReportFilterDto filter);
        Task<List<AttendanceDto>> GetAttendanceAsync(ReportFilterDto filter);
        Task<List<GroupReportDto>> GetGroupReportAsync(ReportFilterDto filter);
        Task<GeneralStatsDto> GetGeneralStatsAsync(ReportFilterDto filter);
    }
}