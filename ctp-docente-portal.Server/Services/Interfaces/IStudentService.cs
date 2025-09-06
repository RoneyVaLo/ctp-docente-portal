using ctp_docente_portal.Server.DTOs.Students;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IStudentService
    {
        Task<List<StudentDto>> GetStudentsBySectionAsync(int sectionId, int userId);
    }
}
