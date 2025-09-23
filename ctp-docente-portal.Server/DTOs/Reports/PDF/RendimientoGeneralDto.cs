namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class RendimientoGeneralDto
    {
        public string Seccion { get; set; } = "";
        public string Materia { get; set; } = "";
        public int Promedio { get; set; }
        public string AsistenciaPromedio { get; set; } = "";
        public int EstudiantesRiesgo { get; set; }
    }
}
