using ctp_docente_portal.Server.DTOs.Reports;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<SectionAttendanceStatsDto>> GetAttendanceStatsBySectionAsync();
        Task<List<GradeReportDto>> GetGradesByGroupOrSubjectAsync(int? groupId = null, string? subject = null);
        Task<StudentConsolidatedReportDto> GetStudentConsolidatedReportAsync(int studentId);
        

    }
}
