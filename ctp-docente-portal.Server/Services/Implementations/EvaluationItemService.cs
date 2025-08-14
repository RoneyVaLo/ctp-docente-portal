using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.DTOs.Students;
using ctp_docente_portal.Server.DTOs.EvaluationItems;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class EvaluationItemService : IEvaluationItemService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IEvaluationCriteriaService _criteriaService;
        private readonly IStudentService _studentService;

        public EvaluationItemService(AppDbContext context, IMapper mapper, IEvaluationCriteriaService criteriaService, IStudentService studentService)
        {
            _context = context;
            _mapper = mapper;
            _criteriaService = criteriaService;
            _studentService = studentService;
        }

        public async Task<EvaluationItemDto> CreateAsync(EvaluationItemCreateDto dto)
        {
            var sectionExists = await _context.SectionAssignments.AnyAsync(sa => sa.Id == dto.SectionAssignmentId);
            if (!sectionExists)
                throw new ArgumentException("La Sección no existe.");

            var total = await _context.EvaluationItems
                .Where(x => x.SectionAssignmentId == dto.SectionAssignmentId)
                .SumAsync(x => x.Percentage);

            if (total + dto.Percentage > 100)
                throw new InvalidOperationException("La suma total no puede superar el 100%.");

            var model = _mapper.Map<EvaluationItemsModel>(dto);
            model.IsDraft = false;
            model.CreatedAt = DateTime.UtcNow;
            model.UpdatedAt = DateTime.UtcNow;

            _context.EvaluationItems.Add(model);
            await _context.SaveChangesAsync();

            return _mapper.Map<EvaluationItemDto>(model);
        }

        public async Task<EvaluationItemDto> UpdateAsync(int id, EvaluationItemUpdateDto dto)
        {
            // Inicia una transacción
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var model = await _context.EvaluationItems.FindAsync(id);
                if (model == null)
                    throw new KeyNotFoundException("Evaluación no encontrada.");

                var total = await _context.EvaluationItems
                    .Where(x => x.SectionAssignmentId == model.SectionAssignmentId && x.Id != id)
                    .SumAsync(x => x.Percentage);

                if (total + dto.Percentage > 100)
                    throw new InvalidOperationException("La suma total no puede superar el 100%.");

                // TODO: Comparar si el modelo tiene HasCriteria como TRUE y si el DTO lo trae en FALSE
                //       Si es el caso, entonces eliminar los Criterios asociados para que no se repitan si se volvieran a activar en un futuro
                //       Pero validando que no tenga notas registradas, si no lanzar un error que no se pueden desactivar los criterios
                _mapper.Map(dto, model);
                model.IsDraft = false;
                model.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                if (dto.HasCriteria && dto.Criteria != null)
                {
                    // Separar criterios existentes y nuevos
                    var criteriaToUpdate = dto.Criteria.Where(c => c.Id > 0).ToList();
                    var criteriaToCreate = dto.Criteria.Where(c => c.Id == 0).ToList();

                    // Actualizar criterios existentes
                    if (criteriaToUpdate.Any())
                    {
                        await _criteriaService.UpdateManyAsync(criteriaToUpdate);
                    }

                    // Crear criterios nuevos
                    if (criteriaToCreate.Any())
                    {
                        await _criteriaService.CreateManyAsync(criteriaToCreate);
                    }
                }

                // Confirma la transacción
                await transaction.CommitAsync();

                return _mapper.Map<EvaluationItemDto>(model);
            }
            catch
            {
                // Si algo falla, revertir todo
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            var model = await _context.EvaluationItems.FindAsync(id);
            if (model == null)
                throw new KeyNotFoundException("Evaluación no encontrada.");

            var hasScores = await _context.StudentEvaluationScores
                .AnyAsync(s => s.EvaluationItemId == id);

            if (hasScores)
                throw new InvalidOperationException("No se puede eliminar, ya existen notas registradas.");

            _context.EvaluationItems.Remove(model);
            await _context.SaveChangesAsync();
        }

        public async Task<EvaluationItemDto> GetByIdAsync(int id)
        {
            var model = await _context.EvaluationItems
                .AsNoTracking()
                .FirstOrDefaultAsync(ei => ei.Id == id);
            if (model == null)
                throw new KeyNotFoundException("Item de Evaluación no encontrado.");

            var evaluationItem = _mapper.Map<EvaluationItemDto>(model);

            var categoryName = await _context.EvaluationCategories
                .Where(ec => ec.Id == model.CategoryId)
                .Select(ec => ec.Name)
                .FirstOrDefaultAsync();
            
            evaluationItem.EvaluationCategoryName = categoryName;


            return evaluationItem;
        }

        // GET All
        public async Task<List<EvaluationItemDto>> GetItemsBySubjectAndSectionAsync(int subjectId, int sectionId)
        {
            int staffId = 53;

            // ✅ Validar si el profesor tiene asignada esa sección
            bool isAssigned = await _context.SectionAssignments
                .AsNoTracking()
                .AnyAsync(sa => sa.SectionId == sectionId && sa.StaffId == staffId);

            if (!isAssigned)
            {
                throw new UnauthorizedAccessException("El profesor no tiene acceso a esta sección.");
            }

            // ✅ Obtener los ítems de evaluación
            var items = await _context.EvaluationItems
                .AsNoTracking()
                .Where(sei => _context.SectionAssignments
                    .Where(sa => sa.SubjectId == subjectId && sa.SectionId == sectionId && sa.StaffId == staffId)
                    .Select(sa => sa.Id)
                    .Contains(sei.SectionAssignmentId)
                )
                //.OrderBy(sei => sei.Id)
                .ToListAsync();

            var categories = await _context.EvaluationCategories
                .AsNoTracking()
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            // ✅ Mapear a DTO
            var itemDtos = items.Select(item => new EvaluationItemDto
            {
                Id = item.Id,
                SectionAssignmentId = item.SectionAssignmentId,
                Description = item.Description,
                EvaluationCategoryName = categories.ContainsKey(item.CategoryId) ? categories[item.CategoryId] : null,
                Name = item.Name,
                Percentage = item.Percentage,
                HasCriteria = item.HasCriteria,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            }).ToList();
            return itemDtos;
        }

        // GET By Id
        public async Task<EvaluationItemDetailsDto> GetDetailsByIdAsync(int id, int? studentId = null)
        {
            var item = await GetByIdAsync(id);

            if (item == null)
                throw new KeyNotFoundException("Item de evaluación no encontrado.");

            // Obtener asignación de sección
            var assignment = await _context.SectionAssignments
                .AsNoTracking()
                .FirstOrDefaultAsync(sa => sa.Id == item.SectionAssignmentId);

            if (assignment == null)
                throw new KeyNotFoundException("Asignación de sección no encontrada.");

            // Obtener CategoryName, SubjectName y SectionName sin cargar entidades completas
            var categoryName = await _context.EvaluationCategories
                .Where(ec => ec.Name == item.EvaluationCategoryName)
                .Select(ec => ec.Name)
                .FirstOrDefaultAsync();

            var subjectName = await _context.Subjects
                .Where(s => s.Id == assignment.SubjectId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();

            var sectionName = await _context.Sections
                .Where(s => s.Id == assignment.SectionId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();

            // Obtener criterios usando servicio reutilizable
            var criteria = await _criteriaService.GetByEvaluationItemIdAsync(item.Id);

            // Obtener todos los estudiantes de la sección usando el servicio
            var studentsDto = await _studentService.GetStudentsBySectionAsync(assignment.SectionId);

            // Filtrar por studentId si fue proporcionado
            if (studentId.HasValue)
                studentsDto = studentsDto.Where(s => s.Id == studentId.Value).ToList();

            // Obtener todas las notas del item
            var allScores = await _context.StudentCriteriaScores
                .Where(s => s.EvaluationItemId == item.Id)
                .ToListAsync();

            // Construir la lista de estudiantes con sus notas (si tienen)
            var studentsWithGrades = studentsDto
                .Select(student => new StudentScoreCriteriaDto
                {
                    StudentId = student.Id,
                    StudentName = student.FullName,
                    ScoresByCriteriaId = allScores
                        .Where(score => score.StudentId == student.Id)
                        .ToDictionary(score => score.CriteriaId, score => score.Score)
                })
                .ToList();


            // Armar el DTO final
            return new EvaluationItemDetailsDto
            {
                ItemName = item.Name,
                Description = item.Description,
                Percentage = item.Percentage,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                EvaluationCategoryName = categoryName,
                SubjectName = subjectName,
                SectionName = sectionName,
                Criteria = criteria,
                StudentScores = studentsWithGrades
            };
        }

        public async Task<int> CreateDraftEvaluationItemAsync(EvaluationItemDraftCreateDto dto)
        {
            var draft = new EvaluationItemsModel
            {
                SectionAssignmentId = dto.SectionAssignmentId,
                Name = string.Empty,
                Description = string.Empty,
                CategoryId = 0,
                Percentage = 0,
                HasCriteria = false,
                IsDraft = true,
                CreatedBy = dto.CreatedBy,
                UpdatedBy = dto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.EvaluationItems.Add(draft);
            await _context.SaveChangesAsync();

            return draft.Id; // Devuelve el ID que se usará para crear rúbricas
        }
    }
}
