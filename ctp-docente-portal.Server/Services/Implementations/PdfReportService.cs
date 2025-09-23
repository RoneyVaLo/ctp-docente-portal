using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.PDF;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class PdfReportService : IPdfReportService
    {
        private readonly AppDbContext _context;

        public PdfReportService(AppDbContext context)
        {
            _context = context;
        }

        // ======================
        // 1. Rendimiento General
        // ======================
        public async Task<byte[]> GenerateGeneralPerformanceAsync(ReportFilterDto filter)
        {
            // Obtener sección
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.Id == filter.SectionId);

            if (section == null)
                throw new ArgumentException("La sección especificada no existe.", nameof(filter.SectionId));

            // Obtener asignaciones de materias en la sección para el período
            var assignments = await _context.SectionAssignments
                .Where(sa => sa.SectionId == filter.SectionId && sa.AcademicPeriodId == filter.AcademicPeriodId)
                .ToListAsync();

            var subjectsIds = assignments.Select(a => a.SubjectId).ToList();
            var subjects = await _context.Subjects
                .Where(m => subjectsIds.Contains(m.Id))
                .ToListAsync();

            // Estudiantes de la sección
            var studentsIds = await _context.SectionStudents
                .Where(ss => ss.SectionId == filter.SectionId)
                .Select(ss => ss.StudentId)
                .ToListAsync();

            var evaluationItems = await _context.EvaluationItems
                .Where(ei => assignments.Select(a => a.Id).Contains(ei.SectionAssignmentId))
                .ToListAsync();

            var evaluationCriteria = await _context.EvaluationCriteria
                .Where(c => evaluationItems.Select(ei => ei.Id).Contains(c.EvaluationItemId))
                .ToListAsync();

            var studentEvaluationScores = await _context.StudentEvaluationScores
                .Where(s => studentsIds.Contains(s.StudentId) &&
                            evaluationItems.Select(ei => ei.Id).Contains(s.EvaluationItemId))
                .ToListAsync();

            var studentCriteriaScores = await _context.StudentCriteriaScores
                .Where(s => studentsIds.Contains(s.StudentId) &&
                            evaluationItems.Select(ei => ei.Id).Contains(s.EvaluationItemId))
                .ToListAsync();

            var attendances = await _context.Attendances
                .Where(a => studentsIds.Contains(a.StudentId) &&
                            subjectsIds.Contains(a.SubjectId))
                .ToListAsync();

            var data = new List<RendimientoGeneralDto>();

            foreach (var subject in subjects)
            {
                var assignmentId = assignments.FirstOrDefault(a => a.SubjectId == subject.Id).Id;
                var subjectItem = evaluationItems.Where(ei => ei.SectionAssignmentId == assignmentId).ToList();

                var studentScores = new List<decimal>();

                foreach (var studentId in studentsIds)
                {
                    decimal studentFinalScore = 0;

                    foreach (var item in subjectItem)
                    {
                        if (item.HasCriteria)
                        {
                            var itemCriteria = evaluationCriteria
                                .Where(c => c.EvaluationItemId == item.Id)
                                .ToList();

                            var scoresCriteria = studentCriteriaScores
                                .Where(s => s.StudentId == studentId && s.EvaluationItemId == item.Id)
                                .ToList();

                            if (scoresCriteria.Any())
                            {
                                decimal criteriaScore = 0;

                                foreach (var criterio in itemCriteria)
                                {
                                    var score = scoresCriteria.FirstOrDefault(p => p.CriteriaId == criterio.Id)?.Score ?? 0;
                                    criteriaScore += (score / 100m) * criterio.Weight;
                                }

                                studentFinalScore += (criteriaScore / 100m) * item.Percentage;
                            }
                        }
                        else
                        {
                            var score = studentEvaluationScores
                                .FirstOrDefault(s => s.StudentId == studentId && s.EvaluationItemId == item.Id)?.Score ?? 0;

                            studentFinalScore += (score / 100m) * item.Percentage;
                        }
                    }

                    studentScores.Add(studentFinalScore);
                }

                int promedio = studentScores.Any()
                    ? (int)Math.Round(studentScores.Average())
                    : 0;

                // --- Asistencia ---
                var asistenciasMateria = attendances
                    .Where(a => a.SubjectId == subject.Id)
                    .ToList();

                string asistenciaPromedio = "0%";
                if (asistenciasMateria.Any())
                {
                    var total = asistenciasMateria.Count;
                    var presentes = asistenciasMateria.Count(a => a.StatusTypeId == 1);
                    asistenciaPromedio = $"{(presentes * 100 / total)}%";
                }

                // --- Estudiantes en riesgo (<60) ---
                int estudiantesRiesgo = studentScores.Count(n => n < 60);

                data.Add(new RendimientoGeneralDto
                {
                    Seccion = section.Name,
                    Materia = subject.Name,
                    Promedio = promedio,
                    AsistenciaPromedio = asistenciaPromedio,
                    EstudiantesRiesgo = estudiantesRiesgo
                });
            }

            return GenerateGeneralPerformance(data);
        }

        private static byte[] GenerateGeneralPerformance(List<RendimientoGeneralDto> data)
        {
            var columns = new List<string> { "MATERIA", "PROMEDIO", "ASISTENCIA", "EN RIESGO" };
            var rows = new List<List<string>>();

            if (data != null && data.Any())
            {
                rows = data
                    .Select(d => new List<string>
                    {
                d.Materia,
                d.Promedio.ToString(),
                d.AsistenciaPromedio,
                d.EstudiantesRiesgo.ToString()
                    }).ToList();
            }

            var section = (data != null && data.Any() && !string.IsNullOrEmpty(data.First().Seccion))
                ? $"{data.First().Seccion}"
                : "";

            return PdfExportHelper.CreateReport(
                "Reporte Académico – Rendimiento General por Sección",
                section,
                "El presente reporte muestra el desempeño académico promedio de cada sección en las distintas materias, considerando asistencia y número de estudiantes en situación de riesgo académico.",
                columns,
                rows
            );
        }

        // ======================
        // 2. Asistencia por Mes
        // ======================
        public async Task<byte[]> GetAttendancePerMonthAsync(ReportFilterDto filter)
        {
            var section = await _context.Sections
                .Where(s => s.Id == filter.SectionId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();

            var subjects = await (
                from sa in _context.SectionAssignments
                join sub in _context.Subjects on sa.SubjectId equals sub.Id
                where sa.AcademicPeriodId == filter.AcademicPeriodId
                   && sa.SectionId == filter.SectionId
                select new { sa.SubjectId, SubjectName = sub.Name }
            ).ToListAsync();

            // Obtener todas las asistencias de la sección
            var allAttendances = await _context.Attendances
                .Where(a => a.SectionId == filter.SectionId)
                .ToListAsync();

            // Obtener todos los meses donde al menos una asistencia exista
            var allMonths = allAttendances
                .Select(a => a.Date.Month)
                .Distinct()
                .OrderBy(m => m)
                .ToList();

            var data = new List<AsistenciaPorMesDto>();

            foreach (var subject in subjects)
            {
                var subjectAttendances = allAttendances
                    .Where(a => a.SubjectId == subject.SubjectId)
                    .ToList();

                var months = allMonths
                    .Select(m =>
                    {
                        var attendancesOfTheMonth = subjectAttendances
                            .Where(a => a.Date.Month == m)
                            .ToList();

                        if (!attendancesOfTheMonth.Any())
                            return "0%";

                        var percentage = (int)(100.0 * attendancesOfTheMonth.Count(a => a.StatusTypeId == 1) / (double)attendancesOfTheMonth.Count);
                        return $"{percentage}%";
                    })
                    .ToList();

                var average = months.Any()
                    ? $"{(int)months.Average(m => int.Parse(m.Trim('%')))}%"
                    : "0%";

                data.Add(new AsistenciaPorMesDto
                {
                    Seccion = section,
                    Materia = subject.SubjectName,
                    Meses = months,
                    Promedio = average
                });
            }

            return GetAttendancePerMonth(data);
        }

        private static byte[] GetAttendancePerMonth(List<AsistenciaPorMesDto> data)
        {
            var columns = new List<string> { "MATERIA" };
            int maxMonths = 0;
            foreach (var d in data)
                if (d.Meses.Count > maxMonths) maxMonths = d.Meses.Count;
            for (int i = 1; i <= maxMonths; i++) columns.Add($"MES {i}");
            columns.Add("PROMEDIO");

            var rows = new List<List<string>>();

            if (data != null && data.Any())
            {


                foreach (var d in data)
                {
                    var row = new List<string> { d.Materia };
                    row.AddRange(d.Meses);
                    while (row.Count < columns.Count - 1) row.Add("N/A");
                    row.Add(d.Promedio);
                    rows.Add(row);
                }
            }

            var section = (data != null && data.Any() && !string.IsNullOrEmpty(data.First().Seccion))
                ? $"{data.First().Seccion}"
                : "";

            return PdfExportHelper.CreateReport(
                "Reporte Académico – Asistencia por Mes",
                section,
                "Este reporte presenta el registro mensual de asistencia de cada sección en las diferentes materias, con el cálculo del promedio general de asistencia.",
                columns,
                rows
            );
        }

        // ======================
        // 3. Estudiantes por Materia
        // ======================
        public async Task<byte[]> GetStudentsBySubjectAsync(ReportFilterDto filter)
        {
            int subjectId = filter.SubjectId ?? 0;
            int sectionId = filter.SectionId;

            // 1. Traer estudiantes
            var students = await (
                from ss in _context.SectionStudents
                join st in _context.Students on ss.StudentId equals st.Id
                where ss.SectionId == sectionId
                select new { st.Id, st.IdentificationNumber, st.Name, st.MiddleName, st.LastName, st.NdLastName }
            ).ToListAsync();

            var studentIds = students.Select(e => e.Id).ToList();

            // 2. Traer ítems de evaluación y criterios
            var items = await (
                from e in _context.EvaluationItems
                join sa in _context.SectionAssignments on e.SectionAssignmentId equals sa.Id
                where sa.SubjectId == subjectId
                      && sa.SectionId == sectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                select new
                {
                    e.Id,
                    e.HasCriteria,
                    e.Percentage
                }
            ).ToListAsync();

            var itemIds = items.Select(i => i.Id).ToList();

            var criteria = await _context.EvaluationCriteria
                .Where(c => itemIds.Contains(c.EvaluationItemId))
                .ToListAsync();

            // 3. Traer notas de students (criterios y directas)
            var studentCriteriaScores = await _context.StudentCriteriaScores
                .Where(s => studentIds.Contains(s.StudentId) && itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            var studentScores = await _context.StudentEvaluationScores
                .Where(s => studentIds.Contains(s.StudentId) && itemIds.Contains(s.EvaluationItemId))
                .ToListAsync();

            // 4. Traer asistencias
            var attendance = await _context.Attendances
                .Where(a => studentIds.Contains(a.StudentId)
                            && a.SectionId == sectionId
                            && a.SubjectId == subjectId)
                .ToListAsync();

            // 5. Calcular promedios y asistencias usando LINQ
            var data = students.Select(est =>
            {
                decimal average = 0;

                foreach (var item in items)
                {
                    decimal itemScore = 0;

                    if (item.HasCriteria)
                    {
                        var itemCriteria = criteria.Where(c => c.EvaluationItemId == item.Id).ToList();
                        if (itemCriteria.Any())
                        {
                            decimal totalWeight = itemCriteria.Sum(c => c.Weight);
                            if (totalWeight == 0) totalWeight = 1;

                            itemScore = itemCriteria.Sum(c =>
                            {
                                var score = studentCriteriaScores
                                    .FirstOrDefault(s => s.StudentId == est.Id
                                                      && s.EvaluationItemId == item.Id
                                                      && s.CriteriaId == c.Id)?.Score ?? 0;
                                return score * (c.Weight / totalWeight);
                            });
                        }
                    }
                    else
                    {
                        itemScore = studentScores
                            .FirstOrDefault(s => s.StudentId == est.Id && s.EvaluationItemId == item.Id)?.Score ?? 0;
                    }

                    average += (itemScore * item.Percentage) / 100m;
                }

                var studentAttendance = attendance.Where(a => a.StudentId == est.Id).ToList();
                string strAttendance = "0%";
                if (studentAttendance.Any())
                {
                    int total = studentAttendance.Count;
                    int presents = studentAttendance.Count(a => a.StatusTypeId == 1);
                    strAttendance = $"{(int)(100.0 * presents / total)}%";
                }

                return new EstudiantesPorMateriaDto
                {
                    Id = est.IdentificationNumber ?? "",
                    NombreCompleto = $"{est.Name} {est.MiddleName} {est.LastName} {est.NdLastName}".Trim(),
                    Promedio = (int)average,
                    Asistencia = strAttendance,
                    Estado = average >= 60 ? "APROBADO" : "REPROBADO"
                };
            }).ToList();
            // Traer nombres de materia y sección
            var subject = await _context.Subjects.Where(s => s.Id == subjectId).Select(s => s.Name).FirstOrDefaultAsync();
            var section = await _context.Sections.Where(s => s.Id == sectionId).Select(s => s.Name).FirstOrDefaultAsync();

            return GetStudentsBySubject(data, subject, section);
        }

        private static byte[] GetStudentsBySubject(List<EstudiantesPorMateriaDto> data, string subject, string section)
        {
            var columns = new List<string> { "ID", "NOMBRE COMPLETO", "PROMEDIO", "ASISTENCIA", "ESTADO" };
            var rows = new List<List<string>>();
            foreach (var d in data)
                rows.Add(new List<string> { d.Id, d.NombreCompleto, d.Promedio.ToString(), d.Asistencia, d.Estado });

            return PdfExportHelper.CreateReport(
                "Reporte Académico – Estudiantes por Materia",
                section,
                "A continuación se detallan los promedios generales obtenidos por los estudiantes en la materia seleccionada.",
                columns,
                rows,
                subject
            );
        }

        // ======================
        // 4. Rendimiento Estudiante
        // ======================
        public async Task<byte[]> GetRendimientoEstudianteAsync(int studentId, ReportFilterDto filter)
        {
            // 1. Estudiante
            var estudiante = await _context.Students
                .Where(s => s.Id == studentId)
                .Select(s => new
                {
                    Nombre = (s.Name + " " + s.MiddleName + " " + s.NdLastName + " " + s.LastName).Trim(),
                    Identificacion = s.IdentificationNumber
                })
                .FirstOrDefaultAsync();

            if (estudiante == null)
                throw new KeyNotFoundException("Estudiante no encontrado");

            // 2. Período académico
            var periodo = await _context.AcademicPeriods
                .Where(p => p.Id == filter.AcademicPeriodId)
                .FirstOrDefaultAsync();

            if (periodo == null)
                throw new KeyNotFoundException("Período académico no encontrado");

            var seccionNombre = await _context.Sections
                .Where(s => s.Id == filter.SectionId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync() ?? "N/A";

            // --- Ítems simples ---
            var simpleGrades = await (
                from ei in _context.EvaluationItems
                join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                join subj in _context.Subjects on sa.SubjectId equals subj.Id
                join se in _context.StudentEvaluationScores
                    .Where(s => s.StudentId == studentId)
                    on ei.Id equals se.EvaluationItemId into scores
                from se in scores.DefaultIfEmpty()
                where !ei.HasCriteria
                      && sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                select new
                {
                    Subject = subj.Name,
                    Evaluation = ei.Name,
                    Score = se != null ? se.Score : 0,
                    ei.Percentage
                }
            ).ToListAsync();

            // --- Ítems con rúbricas ---
            var criteriaGrades = await (
                from ei in _context.EvaluationItems
                join sa in _context.SectionAssignments on ei.SectionAssignmentId equals sa.Id
                join subj in _context.Subjects on sa.SubjectId equals subj.Id
                join sc in _context.StudentCriteriaScores
                    .Where(s => s.StudentId == studentId)
                    on ei.Id equals sc.EvaluationItemId into criteriaScores
                from sc in criteriaScores.DefaultIfEmpty()
                join ec in _context.EvaluationCriteria
                    on sc.CriteriaId equals ec.Id into criteria
                from ec in criteria.DefaultIfEmpty()
                where ei.HasCriteria
                      && sa.SectionId == filter.SectionId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                group new { sc, ec, ei, subj } by new
                {
                    subj.Name,
                    EvaluationId = ei.Id,
                    EvaluationName = ei.Name,
                    ei.Percentage
                }
                into g
                select new
                {
                    Subject = g.Key.Name,
                    Evaluation = g.Key.EvaluationName,
                    Score = g.Any(x => x.sc != null)
                        ? g.Sum(x => (double)x.sc.Score * (double)x.ec.Weight / 100.0)
                        : 0,
                    g.Key.Percentage
                }
            ).ToListAsync();

            // --- Merge ---
            var allGrades = simpleGrades
                .Concat(criteriaGrades.Select(x => new
                {
                    x.Subject,
                    x.Evaluation,
                    Score = (decimal)x.Score,
                    x.Percentage
                }))
                .ToList();

            // --- Promedios por materia ---
            var materiasDto = allGrades
                .GroupBy(x => x.Subject)
                .Select(g =>
                {
                    var promedio = g.Sum(y => y.Score * (y.Percentage / 100m));
                    return new MateriaDto
                    {
                        Asignatura = g.Key,
                        Seccion = seccionNombre,
                        Promedio = (int)Math.Round(promedio),
                        Condicion = promedio >= 70 ? "Aprobado" : "Reprobado"
                    };
                }).ToList();

            // 🔹 Usamos tu misma lógica para asistencias
            var attendanceRecords = await (
                from a in _context.Attendances
                join sa in _context.SectionAssignments on a.SectionId equals sa.SectionId
                where a.StudentId == studentId
                      && sa.AcademicPeriodId == filter.AcademicPeriodId
                      && a.SectionId == filter.SectionId
                select a
            ).ToListAsync();

            int ausenciasJustificadas = attendanceRecords.Count(a => a.StatusTypeId == 3);
            int ausenciasInjustificadas = attendanceRecords.Count(a => a.StatusTypeId == 2);
            int llegadasTardias = attendanceRecords.Count(a => a.MinutesLate > 0);

            // 🔹 Armamos el DTO final
            var dto = new RendimientoEstudianteDto
            {
                Semestre = periodo.Name,
                Nombre = estudiante.Nombre,
                Identificacion = estudiante.Identificacion,
                Seccion = seccionNombre,
                Materias = materiasDto,
                AusenciasJustificadas = ausenciasJustificadas,
                AusenciasInjustificadas = ausenciasInjustificadas,
                LlegadasTardias = llegadasTardias
            };

            return GenerarRendimientoEstudiante(dto);
        }

        private byte[] GenerarRendimientoEstudiante(RendimientoEstudianteDto datos)
        {
            var columns = new List<string> { "Asignatura", "Sección", "Promedio", "Condición" };
            var rows = new List<List<string>>();
            var encabezados = new List<string> { "Ausencias justificadas", "Ausencias injustificadas", "Llegadas tardías" };

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.MarginHorizontal(54);
                    page.MarginVertical(30);
                    page.Size(PageSizes.A4);

                    // Encabezado
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().AlignLeft().Text(datos.Semestre)
                            .FontSize(11).FontFamily("Arial").FontColor(Color.FromHex("#474747"));

                        row.RelativeItem().AlignRight().Text($"Fecha: {DateTime.Now:dd/MM/yyyy}")
                            .FontSize(11).FontFamily("Arial").FontColor(Color.FromHex("#474747"));
                    });

                    // Contenido principal
                    page.Content().Column(col =>
                    {
                        // Nombre de la institución
                        col.Item().PaddingVertical(15).Text("Colegio Técnico Profesional de Los Chiles")
                            .FontSize(14).Bold().FontFamily("Arial").AlignCenter();

                        col.Item().PaddingBottom(15).Text("Reporte Académico – Desempeño del Estudiante")
                            .FontSize(14).Bold().FontFamily("Arial").AlignCenter();

                        // Datos generales
                        col.Item().PaddingBottom(5).Text($"Estudiante: {datos.Nombre}").Bold()
                            .FontSize(12).FontFamily("Arial");
                        col.Item().PaddingBottom(5).Text($"Identificación: {datos.Identificacion}").Bold()
                            .FontSize(12).FontFamily("Arial");
                        col.Item().PaddingBottom(15).Text($"Sección: {datos.Seccion}").Bold()
                            .FontSize(12).FontFamily("Arial");

                        // Tabla de materias
                        col.Item().PaddingTop(15).Table(table =>
                        {
                            // Columnas
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(3); // Asignatura
                                c.RelativeColumn(1); // Sección
                                c.RelativeColumn(1); // Promedio
                                c.RelativeColumn(1); // Condición
                            });

                            // Encabezados
                            foreach (var colName in columns)
                            {
                                table.Cell().Element(CellStyle).AlignMiddle().PaddingVertical(10).PaddingHorizontal(2)
                                    .Text(colName).FontSize(12).Bold().FontFamily("Arial").AlignCenter();
                            }

                            // Filas dinámicas
                            foreach (var materia in datos.Materias)
                            {
                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(materia.Asignatura).FontSize(12).FontFamily("Arial");

                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(materia.Seccion).FontSize(12).FontFamily("Arial").AlignCenter();

                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(materia.Promedio.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(materia.Condicion).FontSize(12).FontFamily("Arial").AlignCenter();
                            }

                            static IContainer CellStyle(IContainer container) =>
                                container.Border(1).BorderColor("#CCC");
                        });

                        // Tabla asistencia
                        col.Item().PaddingTop(20).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn();
                                c.RelativeColumn();
                                c.RelativeColumn();
                            });

                            foreach (var h in encabezados)
                            {
                                table.Cell().Element(CellStyle).AlignMiddle().PaddingVertical(10)
                                    .Text(h).FontSize(12).Bold().FontFamily("Arial").AlignCenter();
                            }

                            table.Cell().Element(CellStyle).AlignMiddle().Padding(6)
                                .Text(datos.AusenciasJustificadas.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                            table.Cell().Element(CellStyle).AlignMiddle().Padding(6)
                                .Text(datos.AusenciasInjustificadas.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                            table.Cell().Element(CellStyle).AlignMiddle().Padding(6)
                                .Text(datos.LlegadasTardias.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                            static IContainer CellStyle(IContainer container) =>
                                container.Border(1).BorderColor("#CCC");
                        });
                    });

                    // Pie de página
                    page.Footer().AlignCenter().Text(txt =>
                    {
                        txt.Span("Página ").FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.CurrentPageNumber().FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.Span(" de ").FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.TotalPages().FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.Span(" | Generado automáticamente por el Portal Docente")
                           .FontSize(10).FontFamily("Arial").FontColor("#474747");
                    });
                });
            }).GeneratePdf();

            return pdf;
        }
    }
}
