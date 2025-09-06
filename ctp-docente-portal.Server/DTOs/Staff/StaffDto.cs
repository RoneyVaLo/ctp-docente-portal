namespace ctp_docente_portal.Server.DTOs.Staff
{
    public class StaffDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string? RoleName { get; set; }
        public List<string>? Roles { get; set; }
    }
}
