using ctp_docente_portal.Server.DTOs.Notifications;
using ctp_docente_portal.Server.Models;                // <- para Attendance
using ctp_docente_portal.Server.Services.Interfaces;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly IWhatsAppApiService _wa;

        public NotificationService(IWhatsAppApiService wa) => _wa = wa;

        public async Task<SendAbsencesResponse> SendAbsencesAsync(
            SendAbsencesRequest request,
            CancellationToken ct = default)
        {
            var resp = new SendAbsencesResponse();

            // TODO: Reemplaza por tu consulta real de AUSENTES (Id, Name, Phone) para la sección/fecha
            var absents = new List<(int Id, string Name, string Phone)>
            {
                // (123, "Alumno Demo", "+5068xxxxxxx")
            };

            foreach (var s in absents)
            {
                var dto = await QueueAbsenceMessageAsync(
                    studentId: s.Id,
                    studentName: s.Name,
                    phoneE164: s.Phone,
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

        public Task<IReadOnlyList<NotificationDto>> ListAsync(
            DateOnly? date, int? sectionId, string? status, CancellationToken ct = default)
        {
            // TODO: SELECT real desde tu tabla de notificaciones
            IReadOnlyList<NotificationDto> empty = Array.Empty<NotificationDto>();
            return Task.FromResult(empty);
        }

        public Task<bool> ResendMessageAsync(int id, CancellationToken ct = default)
        {
            // TODO: Buscar por id, reenviar y actualizar estado
            return Task.FromResult(false);
        }

        // --- SOBRECARGA 1: llamada que reciben desde AttendanceService (1 parámetro) ---
        public Task<NotificationDto> QueueAbsenceMessageAsync(
            Attendance attendance,
            CancellationToken ct = default)
        {
            // Si aquí no tenés el teléfono/nombre, dejamos en cola.
            var name = $"Estudiante {attendance.StudentId}";
            var phone = ""; // TODO: traer de tu BD

            return QueueAbsenceMessageAsync(
                studentId: attendance.StudentId,
                studentName: name,
                phoneE164: phone,
                date: DateOnly.FromDateTime(DateTime.UtcNow), // o la fecha de la asistencia si la tenés
                sectionId: attendance.SectionId,
                ct: ct);
        }

        // --- SOBRECARGA 2: completa (envía el WhatsApp de una vez) ---
        public async Task<NotificationDto> QueueAbsenceMessageAsync(
            int studentId,
            string studentName,
            string phoneE164,
            DateOnly date,
            int sectionId,
            CancellationToken ct = default)
        {
            var message = $"El/la estudiante {studentName} se ausentó el {date:dd/MM/yyyy}.";
            var result = await _wa.SendTextAsync(phoneE164, message, ct);

            return new NotificationDto
            {
                Id = 0, // tu PK real si guardas en BD
                StudentId = studentId,
                StudentName = studentName,
                Phone = phoneE164,
                Message = message,
                Status = result.Success ? "SENT" : "FAILED",
                ProviderMessageId = result.ProviderMessageId,
                CreatedAt = DateTime.UtcNow,
                SentAt = result.Success ? DateTime.UtcNow : null,
                Error = result.Success ? null : result.Error
            };
        }
    }
}
