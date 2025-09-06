using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.DTOs.SectionAssignments
{
    public class SectionAssignmentCreateDto
    {
        public SimpleDto Teacher { get; set; } = new();
        public SimpleDto Subject { get; set; } = new();
        public SimpleDto Section { get; set; } = new();
        public SimpleDto SubSection { get; set; } = new();
        public SimpleDto Period { get; set; } = new();
    }
}
