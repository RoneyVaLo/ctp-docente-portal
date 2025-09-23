using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ctp_docente_portal.Server.Helpers
{
    public static class PdfExportHelper
    {
        public static byte[] CreateReport(string title, string section, string description, List<string> columns, List<List<string>> rows, string subject = "")
        {
            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.MarginHorizontal(54);
                    page.MarginVertical(30);
                    page.Size(PageSizes.A4);

                    page.Header().Row(row =>
                    {
                        if (!string.IsNullOrEmpty(subject))
                        {
                            row.RelativeItem().PaddingBottom(15).AlignLeft().Text(subject)
                                .FontSize(11).FontFamily("Arial").FontColor(Color.FromHex("#474747"));

                            row.RelativeItem().PaddingBottom(15).AlignCenter().Text(section).Bold()
                                .FontSize(11).FontFamily("Arial").FontColor(Color.FromHex("#474747"));
                        } else
                        {
                            row.RelativeItem().PaddingBottom(15).AlignLeft().Text(section).Bold()
                                .FontSize(11).FontFamily("Arial").FontColor(Color.FromHex("#474747"));
                        }

                            row.RelativeItem().PaddingBottom(15).AlignRight().Text($"Fecha: {DateTime.Now:dd/MM/yyyy}")
                                .FontSize(11).FontFamily("Arial").FontColor(Color.FromHex("#474747"));
                    });

                    page.Content().Column(col =>
                    {
                        // Nombre de la institución
                        col.Item().PaddingVertical(15).Text("Colegio Técnico Profesional de Los Chiles")
                            .FontSize(14).Bold().FontFamily("Arial").AlignCenter();

                        col.Item().PaddingBottom(15).Text(title).FontSize(14).Bold().FontFamily("Arial").AlignCenter();

                        if (!string.IsNullOrEmpty(description))
                            col.Item().PaddingBottom(15).Text(description).FontSize(12).FontFamily("Arial").Justify()
                            .LineHeight(1.5f);

                        // 📌 Tabla dinámica
                        col.Item().PaddingTop(15).Table(table =>
                        {
                            // Columnas
                            table.ColumnsDefinition(col =>
                            {
                                foreach (var _ in columns)
                                    col.RelativeColumn();
                            });

                            // Encabezados
                            foreach (var colName in columns)
                            {
                                table.Cell().Element(CellStyle).AlignMiddle().PaddingVertical(10).PaddingHorizontal(2)
                                .Text(colName).FontSize(12).Bold().FontFamily("Arial").AlignCenter().LineHeight(1.5f);
                            }

                            // Filas
                            foreach (var fila in rows)
                            {
                                foreach (var celda in fila)
                                {
                                    table.Cell().Element(CellStyle).AlignMiddle().Padding(4)
                                    .Text(celda).FontSize(12).FontFamily("Arial").LineHeight(1.5f);
                                }
                            }

                            static IContainer CellStyle(IContainer container) =>
                                container.Border(1).BorderColor("#CCC");
                        });
                    });

                    page.Footer().AlignCenter().Text(txt =>
                    {
                        txt.Span("Página ").FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.CurrentPageNumber().FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.Span(" de ").FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.TotalPages().FontSize(10).FontFamily("Arial").FontColor("#474747");
                        txt.Span(" | Generado automáticamente por el Portal Docente").FontSize(10).FontFamily("Arial").FontColor("#474747");
                    });
                });
            });

            return pdf.GeneratePdf();
        }
    }
}
