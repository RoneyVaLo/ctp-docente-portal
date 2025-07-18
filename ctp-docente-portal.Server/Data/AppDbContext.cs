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
        public DbSet<AcademicPeriodsModel> AcademicPeriods { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<EvaluationCriteriaModel> EvaluationCriteria { get; set; }
        public DbSet<SectionAssignmentsModel> SectionAssignments { get; set; }
        public DbSet<StaffModel> Staff { get; set; }
        public DbSet<StudentCriteriaScoresModel> StudentCriteriaScores { get; set; }
        public DbSet<StudentEvaluationScoresModel> StudentEvaluationScores { get; set; }
        public DbSet<SubjectEvaluationItemsModel> SubjectEvaluationItems { get; set; }
        public DbSet<SubjectsModel> Subjects{ get; set; }
        public DbSet<WhatsAppMessage> WhatsAppMessages { get; set; }
    }
}
