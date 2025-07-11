using AutoMapper;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.DTOs.StudentEvaluationScores.Audit;
using ctp_docente_portal.Server.DTOs.StudentEvaluationScores;
using ctp_docente_portal.Server.DTOs.SubjectEvaluationItems;
using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Server.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {
            // SubjectEvaluationItem
            CreateMap<SubjectEvaluationItemsModel, SubjectEvaluationItemCreateDto>().ReverseMap();
            CreateMap<SubjectEvaluationItemsModel, SubjectEvaluationItemUpdateDto>().ReverseMap();
            CreateMap<SubjectEvaluationItemsModel, SubjectEvaluationItemDto>().ReverseMap();

            // EvaluationCriteria
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaCreateDto>().ReverseMap();
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaUpdateDto>().ReverseMap();
            CreateMap<EvaluationCriteriaModel, EvaluationCriteriaDto>().ReverseMap();

            // StudentEvaluationScore
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreCreateDto>().ReverseMap();
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreUpdateDto>().ReverseMap();
            CreateMap<StudentEvaluationScoresModel, StudentEvaluationScoreDto>().ReverseMap();

            // TODO: Configurar luego esto para el tracking correcto
            // Audit
            //CreateMap<AuditStudentEvaluationScore, StudentEvaluationScore>().ReverseMap();
        }

    }
}
