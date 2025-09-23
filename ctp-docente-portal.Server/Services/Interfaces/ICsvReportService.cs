using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.CSV;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface ICsvReportService
    {
        byte[] GenerateStudentCsv(ReportFilterDto filter);
    }
}
