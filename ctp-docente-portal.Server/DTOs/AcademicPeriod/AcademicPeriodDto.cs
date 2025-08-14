namespace ctp_docente_portal.Server.DTOs.AcademicPeriod
{
    public class AcademicPeriodDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
