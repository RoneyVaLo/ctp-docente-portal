using AutoMapper;
using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;
using ctp_docente_portal.Server.DTOs.EvaluationItems;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.DTOs.AcademicPeriod;
using ctp_docente_portal.Server.DTOs.Sections;
using ctp_docente_portal.Server.DTOs.Subjects;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.DTOs.EvaluationCategories;
using ctp_docente_portal.Server.DTOs.Users;
using ctp_docente_portal.Server.DTOs.Staff;
using ctp_docente_portal.Server.DTOs.EvaluationRole;
using ctp_docente_portal.Server.DTOs.Common;

namespace ctp_docente_portal.Server.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {
            // ✅ Attendance
            CreateMap<Attendance, AttendanceSummaryDto>().ReverseMap();
            CreateMap<CreateGroupAttendanceDto, Attendance>().ReverseMap();

            // Users
            CreateMap<UsersModel, UserDto>().ReverseMap();

            // EvaluationCategories
            CreateMap<EvaluationCategoriesModel, EvaluationCategoryDto>().ReverseMap();

            // EvaluationItem
            CreateMap<EvaluationItemsModel, EvaluationItemCreateDto>().ReverseMap();
            CreateMap<EvaluationItemsModel, EvaluationItemUpdateDto>().ReverseMap();
            CreateMap<EvaluationItemsModel, EvaluationItemDto>().ReverseMap();

            // EvaluationCriteria
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaCreateDto>().ReverseMap();
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaUpdateDto>().ReverseMap();
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaDto>().ReverseMap();

            // StudentEvaluationScore
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreCreateDto>().ReverseMap();
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreUpdateDto>().ReverseMap();
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreDto>().ReverseMap();

            // AcademicPeriods
            CreateMap<AcademicPeriodsModel, AcademicPeriodDto>().ReverseMap();
            CreateMap<AcademicPeriodsModel, CreateAcademicPeriodDto>().ReverseMap();
            CreateMap<AcademicPeriodsModel, UpdateAcademicPeriodDto>().ReverseMap();
            
            // Staff
            CreateMap<StaffModel, StaffDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src =>
                    string.Join(" ", new[]
                    {
                        src.Name,
                        src.MiddleName,
                        src.LastName,
                        src.ndLastName
                    }.Where(s => !string.IsNullOrWhiteSpace(s)))
                    ))
                .ReverseMap();

            // Subjects
            CreateMap<SubjectsModel, SubjectDto>().ReverseMap();

            // Sections
            CreateMap<SectionsModel, SectionDto>().ReverseMap();

            // Students
            CreateMap<StudentsModel, StudentDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src =>
                    string.Join(" ", new[]
                    {
                        src.Name,
                        src.MiddleName,
                        src.LastName,
                        src.NdLastName
                    }.Where(s => !string.IsNullOrWhiteSpace(s)))
                    ));

            // Users
            CreateMap<UsersModel, UserDto>().ReverseMap();
            
            // Roles
            CreateMap<EvaluationRolesModel, EvaluationRoleDto>().ReverseMap();
            
            // Enrollments
            CreateMap<EnrollmentsModel, SimpleDto>().ReverseMap();
        }
    }
}
