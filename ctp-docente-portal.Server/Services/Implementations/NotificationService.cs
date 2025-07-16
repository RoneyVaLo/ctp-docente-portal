using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Helpers;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task QueueAbsenceMessageAsync(Attendance attendance)
    {
        var phone = GetResponsiblePhone(attendance.StudentId); // simulado
        var studentName = $"Estudiante #{attendance.StudentId}"; // opcional
        var messageText = MessageTemplateHelper.GenerateAbsenceMessage(studentName, attendance.Date);

        var message = new WhatsAppMessage
        {
            StudentId = attendance.StudentId,
            PhoneNumber = phone,
            Message = messageText,
            CreatedAt = DateTime.UtcNow,
            Sent = false
        };

        _context.WhatsAppMessages.Add(message);
        await _context.SaveChangesAsync();
    }

    private string GetResponsiblePhone(int studentId)
    {
        // Simulado: luego se saca de tabla de responsables
        return "+50688887777";
    }
}
