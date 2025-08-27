using System.Threading;
using System.Threading.Tasks;

namespace ctp_docente_portal.Server.Services.Interfaces
{
 public class WhatsAppSendResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string? ProviderMessageId { get; set; }
}

public interface IWhatsAppApiService
{
    Task<WhatsAppSendResult> SendTextAsync(string phoneE164, string message, CancellationToken ct = default);
}
}
