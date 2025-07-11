using ctp_docente_portal.Server.Models;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public interface IWhatsAppApiService
    {
        Task<bool> SendMessageAsync(WhatsAppMessage message);
    }
}
