using ctp_docente_portal.Server.DTOs.Reports.CSV;
using System.Text;

namespace ctp_docente_portal.Server.Helpers
{
    public static class CsvExportHelper
    {
        public static byte[] ExportToCsv(List<StudentCsvDto> data)
        {
            var sb = new StringBuilder();

            // 1. Obtener todas las columnas dinámicas (union de keys de todos los items)
            var allItemKeys = data.SelectMany(d => d.Items.Keys).Distinct().OrderBy(k => k).ToList();

            // 2. Cabecera
            sb.Append("Id;Nombre;");
            sb.AppendLine(string.Join(";", allItemKeys));

            // 3. Filas
            foreach (var student in data)
            {
                var row = new List<string>
                {
                    student.Id,
                    $"\"{student.Name}\""
                };

                foreach (var key in allItemKeys)
                {
                    row.Add(student.Items.ContainsKey(key) ? student.Items[key].ToString() : "0");
                }

                sb.AppendLine(string.Join(";", row));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
