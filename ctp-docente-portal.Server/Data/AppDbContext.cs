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
        public DbSet<SubjectsModel> Subjects { get; set; }
        public DbSet<WhatsAppMessage> WhatsAppMessages { get; set; }

        public DbSet<Notification> Notifications { get; set; } = null!;

       public DbSet<StudentsModel>        Students         { get; set; } = null!;
        public DbSet<StudentRepresentativesModel> StudentRepresentatives { get; set; } = null!;
        public DbSet<SectionStudentsModel> SectionStudents { get; set; } = null!;
        public DbSet<SectionModel> Sections { get; set; } = null!;

        public DbSet<EnrollmentsModel> Enrollments { get; set; } = null!;
        public DbSet<SectionStudentModel> SectionStudent { get; set; } = null!;
        public DbSet<StudentsModelV2> StudentsV2 { get; set; } = null!;
    }
}
 
