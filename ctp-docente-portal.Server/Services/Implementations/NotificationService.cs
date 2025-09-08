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
        private static string ComposeStudentName(StudentsModel s)
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

            var students = await _db.Students
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
                                join s in _db.Sections.AsNoTracking()
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

            n.Status = "QUEUED";
            n.Error = null;
            n.SentAt = null;
            await _db.SaveChangesAsync(ct);

            string? subjectName = null;
            if (n.SubjectId.HasValue)
            {
                subjectName = await _db.Subjects
                    .Where(s => s.Id == n.SubjectId.Value)
                    .Select(s => s.Name)
                    .FirstOrDefaultAsync(ct);
            }
            var studentName = !string.IsNullOrWhiteSpace(n.StudentName)
                ? n.StudentName!
                : (n.StudentId > 0 ? $"Estudiante {n.StudentId}" : "Estudiante");

            var waRes = await _wa.SendAbsenceTemplateAsync(
                phoneE164: n.Phone!,
                studentName: studentName,
                date: n.Date,              
                subjectName: subjectName,
                subjectId: n.SubjectId,
                ct: ct
            );

            n.Status = waRes.Success ? "SENT" : "FAILED";
            n.Error = waRes.Success ? null : (waRes.Error ?? "SEND_FAILED");
            n.ProviderMessageId = waRes.ProviderMessageId;
            n.SentAt = waRes.Success ? DateTime.UtcNow : null;

            await _db.SaveChangesAsync(ct);
            return waRes.Success;
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
        public async Task<NotificationDto> QueueAbsenceMessageAsync(int studentId,string? studentName,string? phone, DateOnly date,int sectionId, int? subjectId,CancellationToken ct = default)
        {
            var now = DateTime.UtcNow;

            var st = await _db.Students
                .AsNoTracking()
                .Where(s => s.Id == studentId)
                .Select(s => new
                {
                    s.Name,
                    s.MiddleName,
                    s.LastName,
                    s.NdLastName
                })
                .FirstOrDefaultAsync(ct);

            string name = $"Estudiante {studentId}";
            if (st != null)
            {
                var parts = new[] { st.Name, st.MiddleName, st.LastName, st.NdLastName };
                name = string.Join(" ", parts.Where(p => !string.IsNullOrWhiteSpace(p))).Trim();
                if (string.IsNullOrWhiteSpace(name))
                    name = $"Estudiante {studentId}";
            }

            var telefonoRaw = await _db.StudentRepresentatives
                .AsNoTracking()
                .Where(r => r.StudentId == studentId && r.isActive && !string.IsNullOrWhiteSpace(r.PhoneNumber))
                .OrderBy(r => r.Id)
                .Select(r => r.PhoneNumber!.Trim())
                .FirstOrDefaultAsync(ct);

            if (string.IsNullOrWhiteSpace(telefonoRaw))
            {
                telefonoRaw = (phone ?? "").Trim();
            }
            string? telefono = null;

            if (!string.IsNullOrWhiteSpace(telefonoRaw))
            {
                var partes = telefonoRaw.Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var numero = partes.FirstOrDefault();

                if (!string.IsNullOrWhiteSpace(numero))
                {
                    numero = numero.Replace(" ", "").Replace("-", "");
                    if (!numero.StartsWith("506"))
                        numero = "506" + numero;
                    telefono = numero;
                }
            }
            string? subjectName = null;
            if (subjectId.HasValue)
            {
                subjectName = await _db.Subjects
                    .AsNoTracking()
                    .Where(s => s.Id == subjectId.Value)
                    .Select(s => s.Name)
                    .FirstOrDefaultAsync(ct);

                subjectName = string.IsNullOrWhiteSpace(subjectName) ? null : subjectName.Trim();
            }

            var message = subjectId.HasValue
                ? $"El estudiante {name} estuvo ausente el {date:yyyy-MM-dd} (Materia {(subjectName ?? $"#{subjectId.Value}")})."
                : $"El estudiante {name} estuvo ausente el {date:yyyy-MM-dd}.";

            string finalStatus;
            string? providerMessageId = null;
            string? error = null;
            DateTime? sentAt = null;

            if (string.IsNullOrWhiteSpace(telefono))
            {
                finalStatus = "FAILED";
                error = "NO_PHONE";
            }
            else
            {
                var waRes = await _wa.SendAbsenceTemplateAsync(
                    phoneE164: telefono,
                    studentName: name,
                    date: date,
                    subjectName: subjectName,
                    subjectId: subjectId,
                    ct: ct
                );

                finalStatus = waRes.Success ? "SENT" : "FAILED";
                providerMessageId = waRes.ProviderMessageId;
                error = waRes.Success ? null : (waRes.Error ?? "SEND_FAILED");
                sentAt = waRes.Success ? DateTime.UtcNow : null;
            }

            var entity = new Notification
            {
                StudentId = studentId,
                StudentName = name,
                SectionId = sectionId,
                SubjectId = subjectId,
                Phone = telefono,
                Message = message,
                Status = finalStatus,
                Error = error,
                ProviderMessageId = providerMessageId,
                SentAt = sentAt,
                Date = date,
                CreatedAt = now
            };

            _db.Notifications.Add(entity);
            await _db.SaveChangesAsync(ct);

            return ToDto(entity);
        }

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