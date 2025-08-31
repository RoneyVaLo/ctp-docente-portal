using System.Collections.Generic;

namespace ctp_docente_portal.Server.DTOs.Notifications
{
    public sealed class SendAbsencesResponse
    {
        public int Created { get; set; }
        public int Sent { get; set; }
        public int Failed { get; set; }
        public List<NotificationDto> Messages { get; set; } = new();
    }
}
