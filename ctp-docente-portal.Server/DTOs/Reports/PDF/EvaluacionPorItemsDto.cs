namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class EvaluacionPorItemsDto
    {
        public string Id { get; set; } = "";
        public string NombreCompleto { get; set; } = "";
        public List<int> Items { get; set; } = new();
        public int Promedio { get; set; }
    }
}
