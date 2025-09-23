using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.DTOs.Students.Detail;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IStudentService
    {
        Task<List<StudentDto>> GetStudentsBySectionAsync(int sectionId, int userId);
        Task<List<StudentReportDto>> GetStudentReportsAsync(ReportFilterDto filter);
        Task<StudentDetailDto?> GetStudentDetailAsync(int studentId, ReportFilterDto filter);
    }
}
