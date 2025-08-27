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
        public DbSet<EvaluationCategoriesModel> EvaluationCategories { get; set; }
        public DbSet<EvaluationRolesModel> EvaluationRoles { get; set; }
        public DbSet<EvaluationStaffRolesModel> EvaluationStaffRoles { get; set; }
        public DbSet<SectionsModel> Sections { get; set; }
        public DbSet<SectionAssignmentsModel> SectionAssignments { get; set; }
        public DbSet<SectionStudentsModel> SectionStudents { get; set; }
        public DbSet<StaffModel> Staff { get; set; }
        public DbSet<StaffUserLinksModel> StaffUserLinks { get; set; }
        public DbSet<StudentsModel> Students { get; set; }
        public DbSet<StudentCriteriaScoresModel> StudentCriteriaScores { get; set; }
        public DbSet<StudentEvaluationScoresModel> StudentEvaluationScores { get; set; }
        public DbSet<EvaluationItemsModel> EvaluationItems { get; set; }
        public DbSet<SubjectsModel> Subjects{ get; set; }
        public DbSet<UsersModel> Users{ get; set; }

        public DbSet<WhatsAppMessage> WhatsAppMessages { get; set; }
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<StudentRepresentativesModel> StudentRepresentatives { get; set; } = null!;
        public DbSet<EnrollmentsModel> Enrollments { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SectionsModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });

            modelBuilder.Entity<SectionStudentsModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });
            
            modelBuilder.Entity<StaffModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });
            
            modelBuilder.Entity<StudentsModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });
            
            modelBuilder.Entity<UsersModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });

            modelBuilder.Entity<StudentRepresentativesModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });

            modelBuilder.Entity<EnrollmentsModel>(entity =>
            {
                // Indica que EF Core no debe gestionar esta tabla en migraciones
                entity.Metadata.SetIsTableExcludedFromMigrations(true);
            });

            //  Crea un Unique Index compuesto
            modelBuilder.Entity<StudentEvaluationScoresModel>()
                .HasIndex(ses => new { ses.StudentId, ses.EvaluationItemId })
                .IsUnique();
            
            modelBuilder.Entity<StudentCriteriaScoresModel>()
                .HasIndex(scs => new { scs.StudentId, scs.EvaluationItemId, scs.CriteriaId })
                .IsUnique();
            
            modelBuilder.Entity<StaffUserLinksModel>()
                .HasIndex(sul => new { sul.StaffId, sul.UserId })
                .IsUnique();
            
            modelBuilder.Entity<EvaluationStaffRolesModel>()
                .HasIndex(esr => new { esr.StaffId, esr.RoleId })
                .IsUnique();
        }
    }
}
 
