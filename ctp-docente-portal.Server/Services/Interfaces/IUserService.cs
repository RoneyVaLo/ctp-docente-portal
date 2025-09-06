using ctp_docente_portal.Server.DTOs.Users;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    /// <summary>
    /// Interface for user management.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Gets a user by its ID.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <returns>A <see cref="UserDto"/> object representing the user.</returns>
        /// <exception cref="UnauthorizedAccessException">If the user is not found or does not have permissions.</exception>
        Task<UserDto> GetByIdAsync(int id);
        Task<List<UserDto>> GetAllAsync();
    }
}
