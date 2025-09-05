using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Notifications;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _db;
        private readonly IWhatsAppApiService _wa;

        public NotificationService(AppDbContext db, IWhatsAppApiService wa)
        {
            _db = db;
            _wa = wa;
        }

        // ----------------- Helpers -----------------
        private static string ComposeStudentName(StudentsModelV2 s)
        {
            var parts = new[] { s.Name, s.MiddleName, s.LastName, s.NdLastName }
                        .Where(p => !string.IsNullOrWhiteSpace(p));
            return string.Join(" ", parts);
        }

        private async Task<string> GetGuardianPhoneAsync(int studentId, CancellationToken ct)
        {
            // primer encargado ACTIVO con teléfono (prioriza por RelationshipTypeId si querés)
            var phone = await _db.StudentRepresentatives
                .AsNoTracking()
                .Where(r => r.StudentId == studentId
                         && r.isActive
                         && !string.IsNullOrWhiteSpace(r.PhoneNumber))
                .OrderBy(r => r.RelationshipTypeId)
                .Select(r => r.PhoneNumber!)
                .FirstOrDefaultAsync(ct);

            return phone ?? "";
        }

        private static NotificationDto ToDto(Notification n) => new NotificationDto
        {
            Id = n.Id,
            StudentId = n.StudentId,
            StudentName = n.StudentName,
            Phone = n.Phone,
            Message = n.Message,
            Status = n.Status, // SENT | FAILED | QUEUED (aquí usamos SENT/FAILED)
            ProviderMessageId = n.ProviderMessageId,
            CreatedAt = n.CreatedAt,
            SentAt = n.SentAt,
            Error = n.Error
        };

        // ============== Enviar notificaciones de AUSENTES (fecha+sección) ==============
        public async Task<SendAbsencesResponse> SendAbsencesAsync(
            SendAbsencesRequest request, CancellationToken ct = default)
        {
            var resp = new SendAbsencesResponse();

            var day = request.Date; // DateOnly

            var absents = await _db.Attendances
                .AsNoTracking()
                .Where(a => a.SectionId == request.SectionId
                         && a.StatusTypeId == 2     // Ausente
                         && a.Date == day)          // <- DateOnly == DateOnly
                .Select(a => new { a.StudentId, a.SectionId })
                .Distinct()
                .ToListAsync(ct);

            // Evita error de “grupo de métodos”
            if (!absents.Any()) return resp;

            var studentIds = absents.Select(a => a.StudentId).Distinct().ToArray();

            var students = await _db.StudentsV2
                .AsNoTracking()
                .Where(s => studentIds.Contains(s.Id) && s.IsActive)
                .ToDictionaryAsync(s => s.Id, s => s, ct);

            foreach (var a in absents)
            {
                // n.Date debe ser DateOnly en tu modelo Notifications
                bool already = await _db.Notifications.AsNoTracking().AnyAsync(n =>
                    n.StudentId == a.StudentId &&
                    n.SectionId == request.SectionId &&
                    n.Date == day, ct);

                if (already) continue;

                var s = students.GetValueOrDefault(a.StudentId);
                var name = s != null ? ComposeStudentName(s) : $"Estudiante {a.StudentId}";
                var phone = await GetGuardianPhoneAsync(a.StudentId, ct);

                var dto = await QueueAbsenceMessageAsync(
                    studentId: a.StudentId,
                    studentName: name,
                    phoneE164: phone,
                    date: day,                      // DateOnly
                    sectionId: request.SectionId,
                    ct: ct);

                resp.Created++;
                if (dto.Status == "SENT") resp.Sent++;
                else if (dto.Status == "FAILED") resp.Failed++;

                resp.Messages.Add(dto);
            }

            return resp;
        }

        // ================== Listado ==================
        //public async Task<IReadOnlyList<NotificationDto>> ListAsync(
        //    DateOnly? date, int? sectionId, int? subjectId, string? status, CancellationToken ct = default)
        //{
        //    var q = _db.Notifications.AsNoTracking().AsQueryable();

        //    if (date.HasValue) q = q.Where(n => n.Date == date.Value);
        //    if (sectionId.HasValue) q = q.Where(n => n.SectionId == sectionId.Value);
        //    if (subjectId.HasValue) q = q.Where(n => n.SubjectId == subjectId.Value);
        //    if (!string.IsNullOrWhiteSpace(status))
        //    {
        //        var s = status.Trim().ToUpperInvariant();
        //        q = q.Where(n => n.Status == s);
        //    }

        //    return await q.OrderByDescending(n => n.CreatedAt)
        //                  .Take(500)
        //                  .Select(n => ToDto(n))
        //                  .ToListAsync(ct);
        //}
        public async Task<IReadOnlyList<NotificationDto>> ListAsync(DateOnly? date, int? sectionId, int? subjectId, string? status, CancellationToken ct = default)
        {
            // Empieza la consulta de notifications
            var q = _db.Notifications.AsNoTracking().AsQueryable();

            // Aplicar filtros
            if (date.HasValue) q = q.Where(n => n.Date == date.Value);
            if (sectionId.HasValue) q = q.Where(n => n.SectionId == sectionId.Value);
            if (subjectId.HasValue) q = q.Where(n => n.SubjectId == subjectId.Value);
            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToUpperInvariant();
                q = q.Where(n => n.Status == s);
            }

            // Hacer join con las secciones para traer el nombre
            var result = await (from n in q
                                join s in _db.Section.AsNoTracking()
                                    on n.SectionId equals s.Id
                                select new NotificationDto
                                {
                                    Id = n.Id,
                                    StudentId = n.StudentId,
                                    StudentName = n.StudentName,
                                    SectionId = n.SectionId,
                                    SubjectId = n.SubjectId,
                                    Phone = n.Phone,
                                    Message = n.Message,
                                    Status = n.Status,
                                    ProviderMessageId = n.ProviderMessageId,
                                    Date = n.Date,
                                    CreatedAt = n.CreatedAt,
                                    SentAt = n.SentAt,
                                    Error = n.Error,
                                    // Nuevo campo para mostrar nombre de la sección
                                    SectionName = s.Name
                                })
                                .OrderByDescending(n => n.CreatedAt)
                                .Take(500)
                                .ToListAsync(ct);

            return result;
        }
        // ================= Reintentar =================
        public async Task<bool> ResendMessageAsync(int id, CancellationToken ct = default)
        {
            var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (n is null) return false;

            if (string.IsNullOrWhiteSpace(n.Phone))
            {
                n.Status = "FAILED";
                n.Error = "NO_PHONE";
                n.SentAt = null;
                await _db.SaveChangesAsync(ct);
                return false;
            }

            var res = await _wa.SendTextAsync(n.Phone, n.Message, ct);
            n.Status = res.Success ? "SENT" : "FAILED";
            n.Error = res.Success ? null : res.Error;
            n.ProviderMessageId = res.ProviderMessageId;
            n.SentAt = res.Success ? DateTime.UtcNow : null;

            await _db.SaveChangesAsync(ct);
            return res.Success;
        }

        // ======= Encola/envía UNA (usado por SendAbsencesAsync) =======
        public async Task<NotificationDto> QueueAbsenceMessageAsync(
            int studentId, string studentName, string phoneE164,
            DateOnly date, int sectionId, CancellationToken ct = default)
        {
            var message = $"El/la estudiante {studentName} se ausentó el {date:dd/MM/yyyy}.";

            var send = !string.IsNullOrWhiteSpace(phoneE164)
                ? await _wa.SendTextAsync(phoneE164, message, ct)
                : new WhatsAppSendResult { Success = false, Error = "NO_PHONE" };

            var entity = new Notification
            {
                StudentId = studentId,
                StudentName = studentName,
                Phone = phoneE164 ?? "",
                Date = date,
                SectionId = sectionId,
                Message = message,
                Status = send.Success ? "SENT" : "FAILED",
                ProviderMessageId = send.ProviderMessageId,
                Error = send.Success ? null : send.Error,
                CreatedAt = DateTime.UtcNow,
                SentAt = send.Success ? DateTime.UtcNow : null
            };

            _db.Notifications.Add(entity);
            await _db.SaveChangesAsync(ct);

            return ToDto(entity);
        }
        public async Task<NotificationDto> QueueAbsenceMessageAsync(
     int studentId,
     string? studentName,
     string? phone,
     DateOnly date,
     int sectionId,
     int? subjectId,
     CancellationToken ct = default)
        {
            var now = DateTime.UtcNow;


            var conn = _db.Database.GetDbConnection();
            var mustClose = false;
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync(ct);
                mustClose = true;
            }

            string name = $"Estudiante {studentId}";
            string telefono = "";

            await using (var cmd = conn.CreateCommand())
            {

                cmd.CommandText = @"
            SELECT
                trim(concat_ws(' ', ""Name"", ""MiddleName"", ""LastName"", ""ndLastName"")) AS full_name,
                COALESCE(""FamilyPhoneNumber""::text, '') AS family_phone
            FROM public.""Students""
            WHERE ""Id"" = @id
            LIMIT 1";

                var p = cmd.CreateParameter();
                p.ParameterName = "@id";
                p.Value = studentId;
                cmd.Parameters.Add(p);

                await using var reader = await cmd.ExecuteReaderAsync(ct);
                if (await reader.ReadAsync(ct))
                {
                    var fullName = reader.IsDBNull(0) ? null : reader.GetString(0);
                    var familyPhone = reader.IsDBNull(1) ? "" : reader.GetString(1);

                    if (!string.IsNullOrWhiteSpace(fullName))
                        name = fullName.Trim();

                    // Teléfono dinámico desde FamilyPhoneNumber
                    telefono = (familyPhone ?? "").Trim();
                }
            }


            if (string.IsNullOrWhiteSpace(telefono))
                telefono = (phone ?? "").Trim();


            var message = subjectId.HasValue
                ? $"El estudiante {name} estuvo ausente el {date:yyyy-MM-dd} (Materia #{subjectId})."
                : $"El estudiante {name} estuvo ausente el {date:yyyy-MM-dd}.";



            var token = "EAALSAZBIbFYQBPaQ7fF2VDozoupq8ZBTHWwVHcRXPMsfzpu9Q0FInGG4KPJqNZCWg9ZCo8pPaaQiQWlK3YPDVwztu8vUIB7bzbpK68MxKUlU9lmujrgDaLYpWrDegeU81BhQicLgW2RlJbAb1F4HVU6VnBM7qpw7wtVJf7AgWmcjQfrQe0ESZCNlNaPfvV5VVBIxa2XJuLavVqdhlEyMWLBZAMGiEeFSqolilVOSFpdHCXZBQZDZD";
            var idTelefono = "825978877256138";

            if (!string.IsNullOrWhiteSpace(token) &&
                !string.IsNullOrWhiteSpace(idTelefono) &&
                !string.IsNullOrWhiteSpace(telefono))
            {

                //Token
                HttpClient client = new HttpClient();
                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://graph.facebook.com/v15.0/" + idTelefono + "/messages");
                request.Headers.Add("Authorization", "Bearer " + token);
                request.Content = new StringContent("{ \"messaging_product\": \"whatsapp\", \"to\": \"" + telefono + "\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }");
                request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                HttpResponseMessage response = await client.SendAsync(request);
                //response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
            

        }


            var entity = new Notification
            {
                StudentId = studentId,
                StudentName = name,
                SectionId = sectionId,
                SubjectId = subjectId,
                Phone = telefono,
                Message = message,
                Status = "QUEUED",
                Date = date,
                CreatedAt = now
            };

            _db.Notifications.Add(entity);
            await _db.SaveChangesAsync(ct);

            if (mustClose) await conn.CloseAsync();

            return ToDto(entity);
        }




        // compatibilidad con tu interfaz (por si la llaman desde AttendanceService)
        public Task<NotificationDto> QueueAbsenceMessageAsync(Attendance a, CancellationToken ct = default) =>
            QueueAbsenceMessageAsync(
                studentId: a.StudentId,
                studentName: $"Estudiante",
                phone: "",
                date: a.Date,
                sectionId: a.SectionId,
                subjectId: a.SubjectId,
                ct: ct);
    }
}