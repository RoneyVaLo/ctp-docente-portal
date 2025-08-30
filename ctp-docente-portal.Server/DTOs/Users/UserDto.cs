namespace ctp_docente_portal.Server.DTOs.Users
{
    /// <summary>
    /// Represents a user in the application.
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// Unique user identifier.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// User's email.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Username of the user.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Roles assigned to the user.
        /// </summary>
        public IEnumerable<string> Roles { get; set; }
    }
}
