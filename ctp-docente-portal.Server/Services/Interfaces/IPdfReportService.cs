using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.PDF;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IPdfReportService
    {
        Task<byte[]> GenerateGeneralPerformanceAsync(int userId, ReportFilterDto filter);
        Task<byte[]> GetAttendancePerMonthAsync(ReportFilterDto filter);
        Task<byte[]> GetStudentsBySubjectAsync(ReportFilterDto filter);
        //byte[] GenerarRendimientoEstudiante(RendimientoEstudianteDto estudiante);
        Task<byte[]> GetStudentPerformanceAsync(int userId, int studentId, ReportFilterDto filter);
    }
}
