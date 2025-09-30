namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class EvaluationByItemsDto
    {
        public string Id { get; set; } = "";
        public string FullName { get; set; } = "";
        public List<int> Items { get; set; } = new();
        public int Average { get; set; }
    }
}
