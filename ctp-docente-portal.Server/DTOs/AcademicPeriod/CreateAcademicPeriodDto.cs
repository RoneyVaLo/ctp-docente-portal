using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.DTOs.AcademicPeriod
{
    public class CreateAcademicPeriodDto
    {
        public string Name { get; set; }
        public SimpleDto Enrollment { get; set; }
        public DateTime Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
