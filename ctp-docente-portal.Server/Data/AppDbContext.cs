using ctp_docente_portal.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
           : base(options)
        {

        }

        public DbSet<StaffModel> Staff { get; set; }
    }
}
