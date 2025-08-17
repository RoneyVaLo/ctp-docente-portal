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
        public async Task<SendAbsencesResponse> SendAbsencesAsync(SendAbsencesRequest request, CancellationToken ct = default)
        {
            var resp = new SendAbsencesResponse();

            // Attendance.Date es DateTime -> comparamos por rango del día (index-friendly)
            var from = request.Date.ToDateTime(TimeOnly.MinValue);
            var to   = request.Date.AddDays(1).ToDateTime(TimeOnly.MinValue);

            var absents = await _db.Attendances
                .AsNoTracking()
                .Where(a => a.SectionId == request.SectionId
                         && a.StatusTypeId == 2   // 2 = Ausente
                         && a.Date >= from && a.Date < to)
                .Select(a => new { a.StudentId, a.SectionId }) // columnas mínimas
                .Distinct()
                .ToListAsync(ct);

            if (absents.Count == 0) return resp;

            var studentIds = absents.Select(a => a.StudentId).Distinct().ToArray();

            var students = await _db.Students
                .AsNoTracking()
                .Where(s => studentIds.Contains(s.Id) && s.IsActive)
                .ToDictionaryAsync(s => s.Id, s => s, ct);

            foreach (var a in absents)
            {
                // Evitar duplicado mismo estudiante/fecha/sección
                bool already = await _db.Notifications.AsNoTracking().AnyAsync(n =>
                    n.StudentId == a.StudentId &&
                    n.SectionId == request.SectionId &&
                    n.Date == request.Date, ct);
                if (already) continue;

                var s = students.GetValueOrDefault(a.StudentId);
                var name = s != null ? ComposeStudentName(s) : $"Estudiante {a.StudentId}";
                var phone = await GetGuardianPhoneAsync(a.StudentId, ct);

                var dto = await QueueAbsenceMessageAsync(
                    studentId: a.StudentId,
                    studentName: name,
                    phoneE164: phone,
                    date: request.Date,
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
        public async Task<IReadOnlyList<NotificationDto>> ListAsync(
            DateOnly? date, int? sectionId, string? status, CancellationToken ct = default)
        {
            var q = _db.Notifications.AsNoTracking().AsQueryable();

            if (date.HasValue)      q = q.Where(n => n.Date == date.Value);
            if (sectionId.HasValue) q = q.Where(n => n.SectionId == sectionId.Value);
            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToUpperInvariant();
                q = q.Where(n => n.Status == s);
            }

            return await q.OrderByDescending(n => n.CreatedAt)
                          .Take(500) // límite sano
                          .Select(n => ToDto(n))
                          .ToListAsync(ct);
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

        // compatibilidad con tu interfaz (por si la llaman desde AttendanceService)
        public Task<NotificationDto> QueueAbsenceMessageAsync(Attendance a, CancellationToken ct = default)
            => QueueAbsenceMessageAsync(
                a.StudentId,
                $"Estudiante {a.StudentId}",
                "",
                DateOnly.FromDateTime(a.Date),
                a.SectionId,
                ct);
    }
}
