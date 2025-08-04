using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Encola un mensaje de WhatsApp para un estudiante ausente.
        /// </summary>
        public async Task QueueAbsenceMessageAsync(Attendance attendance)
        {
            // ⚠️ Esto debería venir de la BD en el futuro
            var phone = "+50688885555";

            var message = new WhatsAppMessage
            {
                StudentId = attendance.StudentId,
                PhoneNumber = phone,
                Message = $"El estudiante #{attendance.StudentId} estuvo ausente el día {attendance.Date:dd/MM/yyyy}",
                CreatedAt = DateTime.UtcNow
            };

            _context.WhatsAppMessages.Add(message);
            await _context.SaveChangesAsync();
        }
    }
}

