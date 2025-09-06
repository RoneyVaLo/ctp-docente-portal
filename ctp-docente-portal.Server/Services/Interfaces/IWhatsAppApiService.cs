using System.Threading;
using System.Threading.Tasks;

namespace ctp_docente_portal.Server.Services.Interfaces
{
    public class WhatsAppSendResult
    {
        public bool Success { get; set; }
        public string? ProviderMessageId { get; set; }
        public string? Error { get; set; }
        public string? RawResponse { get; set; }
    }

    public interface IWhatsAppApiService
    {
        Task<WhatsAppSendResult> SendTextAsync(string phoneE164, string message, CancellationToken ct = default);

        Task<WhatsAppSendResult> SendTemplateAsync(
            string phoneE164,
            string templateName,
            string languageCode,
            string[] bodyParameters,
            CancellationToken ct = default);

        Task<WhatsAppSendResult> SendAbsenceTemplateAsync(
            string phoneE164,
            string studentName,
            DateOnly date,
            string? subjectName,
            int? subjectId,
            CancellationToken ct = default);
    }

}