using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Reports;
using ctp_docente_portal.Server.DTOs.Reports.PDF;
using ctp_docente_portal.Server.Helpers;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Globalization;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class PdfReportService : IPdfReportService
    {
        private readonly AppDbContext _context;
        private readonly IReportService _reportService;
        private readonly IStudentService _studentService;

        public PdfReportService(AppDbContext context, IReportService reportService, IStudentService studentService)
        {
            _context = context;
            _reportService = reportService;
            _studentService = studentService;
        }

        // ======================
        // 1. Rendimiento General
        // ======================
        public async Task<byte[]> GenerateGeneralPerformanceAsync(int userId, ReportFilterDto filter)
        {
            var data = await _reportService.GetPerformanceDataAsync(userId, filter);
            var performanceData = data.Select(d => new GeneralPerformanceDto
            {
                Section = d.Section,
                Subject = d.Subject,
                Average = (int)d.Average,
                AverageAttendance = $"{Math.Round(d.AttendancePercentage)}%" ?? "0%",
                StudentsAtRisk = d.StudentsAtRisk
            }).ToList();
            return GenerateGeneralPerformance(performanceData);
        }

        private static byte[] GenerateGeneralPerformance(List<GeneralPerformanceDto> data)
        {
            var columns = new List<string> { "Materia", "Promedio", "Asistencia", "En Riesgo" };
            var rows = new List<List<string>>();

            if (data != null && data.Any())
            {
                rows = data
                    .Select(d => new List<string>
                    {
                d.Subject,
                d.Average.ToString(),
                d.AverageAttendance,
                d.StudentsAtRisk.ToString()
                    }).ToList();
            }

            var section = (data != null && data.Any() && !string.IsNullOrEmpty(data.First().Section))
                ? $"{data.First().Section}"
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
        public async Task<byte[]> GetAttendancePerMonthAsync(int userId, ReportFilterDto filter)
        {
            // Obtener StaffId del usuario
            var staffId = await StaffHelper.GetStaffIdAsync(_context, userId);
            if (staffId == 0) return Array.Empty<byte>();

            bool isAdmin = await StaffHelper.IsAdminAsync(_context, staffId);


            var section = await _context.Sections
                .Where(s => s.Id == filter.SectionId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();

            if (section == null)
                throw new ArgumentException("La sección especificada no existe.");

            // --- Obtener el periodo académico ---
            var academicPeriod = await _context.AcademicPeriods
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == filter.AcademicPeriodId);

            if (academicPeriod == null)
                throw new KeyNotFoundException("El periodo académico no existe.");


            var subjects = await (
                from sa in _context.SectionAssignments
                join sub in _context.Subjects on sa.SubjectId equals sub.Id
                where sa.AcademicPeriodId == filter.AcademicPeriodId
                   && sa.SectionId == filter.SectionId
                   && (isAdmin || sa.StaffId == staffId)
                select new { sa.SubjectId, SubjectName = sub.Name }
            ).ToListAsync();

            var allAttendances = await _context.Attendances
                .Where(a =>
                       a.SectionId == filter.SectionId &&
                       a.Date >= DateOnly.FromDateTime(academicPeriod.StartDate) &&
                       a.Date <= DateOnly.FromDateTime(academicPeriod.EndDate)
                )
                .ToListAsync();


            var allMonths = allAttendances
                .Select(a => a.Date.Month)
                .Distinct()
                .OrderBy(m => m)
                .ToList();

            var data = new List<AttendancePerMonthDto>();

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

                        int total = attendancesOfTheMonth.Count;
                        int presents = attendancesOfTheMonth.Count(a => a.StatusTypeId == 1);
                        int justified = attendancesOfTheMonth.Count(a => a.StatusTypeId == 3);

                        double weighted = presents + (justified * 0.5);
                        double percentage = total == 0 ? 0 : Math.Round((weighted * 100) / total);


                        return $"{percentage}%";
                    })
                    .ToList();

                string average = "0%";
                if (subjectAttendances.Any())
                {
                    int total = subjectAttendances.Count;
                    int presents = subjectAttendances.Count(a => a.StatusTypeId == 1);
                    int justified = subjectAttendances.Count(a => a.StatusTypeId == 3);

                    double weighted = presents + (justified * 0.5);
                    double avgPercentage = total == 0 ? 0 : Math.Round((weighted * 100) / total);

                    average = $"{avgPercentage}%";
                }


                data.Add(new AttendancePerMonthDto
                {
                    Section = section ?? "",
                    Subject = subject.SubjectName,
                    Months = months,
                    Average = average
                });
            }

            return GetAttendancePerMonth(data, allMonths);
        }

        private static byte[] GetAttendancePerMonth(List<AttendancePerMonthDto> data, List<int> allMonths)
        {
            var columns = new List<string> { "Materia" };

            columns.AddRange(allMonths.Select(m => $"Mes {m.ToString()}"));

            columns.Add("Promedio");

            var rows = new List<List<string>>();

            if (data != null && data.Any())
            {


                foreach (var d in data)
                {
                    var row = new List<string> { d.Subject };
                    row.AddRange(d.Months);
                    while (row.Count < columns.Count - 1) row.Add("N/A");
                    row.Add(d.Average);
                    rows.Add(row);
                }
            }

            var section = (data != null && data.Any() && !string.IsNullOrEmpty(data.First().Section))
                ? $"{data.First().Section}"
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
            var performance = await _reportService.GetStudentPerformanceAsync(filter);

            var data = performance.Select(p => new StudentsBySubjectDto
            {
                Id = p.Identification,
                FullName = p.FullName,
                Average = (int)p.Average,
                Attendance = $"{(int)p.AttendancePercentage}%" ?? "0%",
                Status = p.Average >= 60 ? "APROBADO" : "REPROBADO"
            }).ToList();

            var subject = await _context.Subjects
                .Where(s => s.Id == filter.SubjectId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();

            var section = await _context.Sections
                .Where(s => s.Id == filter.SectionId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();

            return GetStudentsBySubject(data, subject ?? "", section ?? "");
        }

        private static byte[] GetStudentsBySubject(List<StudentsBySubjectDto> data, string subject, string section)
        {
            var columns = new List<string> { "Identificación", "Nombre Completo", "Promedio", "Asistencia", "Estado" };
            var rows = new List<List<string>>();
            foreach (var d in data)
                rows.Add(new List<string> { d.Id, d.FullName, d.Average.ToString(), d.Attendance, d.Status });

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
        public async Task<byte[]> GetStudentPerformanceAsync(int userId, int studentId, ReportFilterDto filter)
        {
            var studentDetail = await _studentService.GetStudentDetailAsync(userId, studentId, filter);

            var period = await _context.AcademicPeriods
                .Where(p => p.Id == filter.AcademicPeriodId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync();

            if (period == null)
                throw new KeyNotFoundException("Período académico no encontrado");

            var subjectsDto = studentDetail.Grades
                .Select(g =>
                {
                    var promedio = g.Value.First().Average ?? 0;

                    return new SubjectReportDto
                    {
                        Subject = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(g.Key.Replace("_", " ")),
                        Section = studentDetail.Group,
                        Average = (int)Math.Round(promedio),
                        Condition = promedio >= 70 ? "Aprobado" : "Reprobado"
                    };
                })
                .ToList();

            var attendance = studentDetail.Attendance;

            var dto = new DTOs.Reports.PDF.StudentPerformanceDto
            {
                Semester = period,
                Name = studentDetail.FullName,
                Identification = studentDetail.Identification,
                Section = studentDetail.Group,
                Subjects = subjectsDto,
                JustifiedAbsences = attendance.Justified,
                UnjustifiedAbsences = attendance.Absent,
                LateArrivals = attendance.Late
            };

            return GenerateStudentPerformance(dto);
        }

        private byte[] GenerateStudentPerformance(DTOs.Reports.PDF.StudentPerformanceDto datos)
        {
            var columns = new List<string> { "Asignatura", "Sección", "Promedio", "Condición" };
            var rows = new List<List<string>>();
            var headers = new List<string> { "Ausencias justificadas", "Ausencias injustificadas", "Llegadas tardías" };

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
                        row.RelativeItem().AlignLeft().Text(datos.Semester)
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
                        col.Item().PaddingBottom(5).Text($"Estudiante: {datos.Name}").Bold()
                            .FontSize(12).FontFamily("Arial");
                        col.Item().PaddingBottom(5).Text($"Identificación: {datos.Identification}").Bold()
                            .FontSize(12).FontFamily("Arial");
                        col.Item().PaddingBottom(15).Text($"Sección: {datos.Section}").Bold()
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
                            foreach (var subject in datos.Subjects)
                            {
                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(subject.Subject).FontSize(12).FontFamily("Arial");

                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(subject.Section).FontSize(12).FontFamily("Arial").AlignCenter();

                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(subject.Average.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                                table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(subject.Condition).FontSize(12).FontFamily("Arial").AlignCenter();
                            }

                            static IContainer CellStyle(IContainer container) =>
                                container.Border(1).BorderColor("#CCC");
                        });

                        col.Item().PaddingTop(20).PaddingBottom(10).Text("Asistencia").AlignCenter().Bold()
                            .FontSize(12).FontFamily("Arial");

                        // Tabla asistencia
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn();
                                c.RelativeColumn();
                                c.RelativeColumn();
                            });

                            foreach (var h in headers)
                            {
                                table.Cell().Element(CellStyle).AlignMiddle().PaddingVertical(10)
                                    .Text(h).FontSize(12).Bold().FontFamily("Arial").AlignCenter();
                            }

                            table.Cell().Element(CellStyle).AlignMiddle().Padding(6)
                                .Text(datos.JustifiedAbsences.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                            table.Cell().Element(CellStyle).AlignMiddle().Padding(6)
                                .Text(datos.UnjustifiedAbsences.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

                            table.Cell().Element(CellStyle).AlignMiddle().Padding(6)
                                .Text(datos.LateArrivals.ToString()).FontSize(12).FontFamily("Arial").AlignCenter();

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
