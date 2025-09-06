using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.DTOs.SectionAssignments
{
    public class SectionAssignmentDto
    {
        public int Id { get; set; }
        public SimpleDto Teacher { get; set; }
        public SimpleDto Subject { get; set; }
        public SimpleDto Section { get; set; }
        public SimpleDto SubSection { get; set; }
        public SimpleDto Period { get; set; }
    }
}
