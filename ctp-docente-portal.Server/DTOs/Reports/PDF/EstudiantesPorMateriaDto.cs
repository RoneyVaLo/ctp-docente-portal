namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class EstudiantesPorMateriaDto
    {
        public string Id { get; set; } = "";
        public string NombreCompleto { get; set; } = "";
        public int Promedio { get; set; }
        public string Asistencia { get; set; } = "";
        public string Estado { get; set; } = "";
    }
}
