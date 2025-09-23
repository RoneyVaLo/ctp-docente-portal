namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class AsistenciaPorMesDto
    {
        public string Seccion { get; set; } = "";
        public string Materia { get; set; } = "";
        public List<string> Meses { get; set; } = new();
        public string Promedio { get; set; } = "";
    }
}
