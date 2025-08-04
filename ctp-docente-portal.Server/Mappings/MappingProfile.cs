using AutoMapper;
using ctp_docente_portal.Server.DTOs.Attendance;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;
using ctp_docente_portal.Server.DTOs.SubjectEvaluationItems;
using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Server.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ✅ Attendance
            CreateMap<Attendance, AttendanceSummaryDto>().ReverseMap();
            CreateMap<CreateGroupAttendanceDto, Attendance>().ReverseMap();

            // ✅ SubjectEvaluationItem
            CreateMap<SubjectEvaluationItemsModel, SubjectEvaluationItemCreateDto>().ReverseMap();
            CreateMap<SubjectEvaluationItemsModel, SubjectEvaluationItemUpdateDto>().ReverseMap();
            CreateMap<SubjectEvaluationItemsModel, SubjectEvaluationItemDto>().ReverseMap();

            // ✅ EvaluationCriteria
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaCreateDto>().ReverseMap();
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaUpdateDto>().ReverseMap();
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaDto>().ReverseMap();

            // ✅ StudentEvaluationScore
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreCreateDto>().ReverseMap();
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreUpdateDto>().ReverseMap();
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreDto>().ReverseMap();
        }
    }
}
