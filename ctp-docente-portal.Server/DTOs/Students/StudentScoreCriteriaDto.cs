namespace ctp_docente_portal.Server.DTOs.Students
{
    public class StudentScoreCriteriaDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public Dictionary<int, decimal> ScoresByCriteriaId { get; set; } // clave: CriteriaId, valor: nota
    }
}
