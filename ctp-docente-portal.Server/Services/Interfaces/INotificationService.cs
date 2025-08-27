using ctp_docente_portal.Server.Models;               // <-- Asegúrate de tener este using
using ctp_docente_portal.Server.DTOs.Notifications;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface INotificationService
    {
        Task<SendAbsencesResponse> SendAbsencesAsync(SendAbsencesRequest request, CancellationToken ct = default);
        Task<IReadOnlyList<NotificationDto>> ListAsync(DateOnly? date, int? sectionId, string? status, CancellationToken ct = default);
        Task<bool> ResendMessageAsync(int id, CancellationToken ct = default);

        // NUEVO: para la llamada que hace AttendanceService con un solo parámetro
        Task<NotificationDto> QueueAbsenceMessageAsync(Attendance attendance, CancellationToken ct = default);

        

        Task<NotificationDto> QueueAbsenceMessageAsync(
            int studentId, string studentName, string phoneE164, DateOnly date, int sectionId, CancellationToken ct = default);
    }
}