namespace ctp_docente_portal.Server.DTOs.Reports
{
    public class SectionAssignmentWithSubject
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public int StaffId { get; set; }
        public string SubjectName { get; set; } = "";
    }
}
