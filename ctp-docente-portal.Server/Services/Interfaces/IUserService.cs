using ctp_docente_portal.Server.DTOs.Users;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetByIdAsync(int id);
    }
}
