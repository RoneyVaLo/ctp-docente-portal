using ctp_docente_portal.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Helpers
{
    public class StaffHelper
    {
        public static async Task<int> GetStaffIdAsync(AppDbContext context, int userId)
        {
            return await context.StaffUserLinks
                .Where(x => x.UserId == userId)
                .Select(x => x.StaffId)
                .FirstOrDefaultAsync();
        }

        public static async Task<bool> IsAdminAsync(AppDbContext context, int staffId)
        {
            return await (
                from sr in context.EvaluationStaffRoles
                join r in context.EvaluationRoles on sr.RoleId equals r.Id
                where sr.StaffId == staffId
                select r.Name
            ).AnyAsync(name => name == "Administrativo");
        }
    }
}
