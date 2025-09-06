using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.DTOs.SectionAssignments
{
    public class SectionAssignmentUpdateDto
    {
        public int Id { get; set; }
        public SimpleDto Teacher { get; set; } = new();
        public SimpleDto Subject { get; set; } = new();
        public SimpleDto Section { get; set; } = new();
        public SimpleDto SubSection { get; set; } = new();
        public SimpleDto Period { get; set; } = new();
    }
}
