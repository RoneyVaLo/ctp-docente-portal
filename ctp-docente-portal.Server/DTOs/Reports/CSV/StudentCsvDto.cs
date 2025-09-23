namespace ctp_docente_portal.Server.DTOs.Reports.CSV
{
    public class StudentCsvDto
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public Dictionary<string, int> Items { get; set; } = new();
    }
}
