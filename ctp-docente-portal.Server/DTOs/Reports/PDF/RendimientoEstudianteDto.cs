namespace ctp_docente_portal.Server.DTOs.Reports.PDF
{
    public class RendimientoEstudianteDto
    {
        public string Semestre { get; set; }
        public string Nombre { get; set; }
        public string Identificacion { get; set; }
        public string Seccion { get; set; }
        public List<MateriaDto> Materias { get; set; } = new();
        public int AusenciasJustificadas { get; set; }
        public int AusenciasInjustificadas { get; set; }
        public int LlegadasTardias { get; set; }
    }

    public class MateriaDto
    {
        public string Asignatura { get; set; }
        public string Seccion { get; set; }
        public int Promedio { get; set; }
        public string Condicion { get; set; }
    }
}
