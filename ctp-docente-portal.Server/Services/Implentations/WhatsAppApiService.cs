using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class WhatsAppApiSettings
    {
        public string PhoneNumberId { get; set; } = ""; // p.ej. "123456789012345"
        public string AccessToken { get; set; } = ""; // token de Meta
        public string ApiVersion { get; set; } = "v20.0";
    }

    public class WhatsAppApiService : IWhatsAppApiService
    {
        private readonly HttpClient _http;
        private readonly WhatsAppApiSettings _cfg;

        public WhatsAppApiService(HttpClient httpClient, IOptions<WhatsAppApiSettings> cfg)
        {
            _http = httpClient;
            _cfg = cfg.Value;
        }

        public async Task<WhatsAppSendResult> SendTextAsync(string phoneE164, string message, CancellationToken ct = default)
        {
            try
            {
                var url = $"https://graph.facebook.com/{_cfg.ApiVersion}/{_cfg.PhoneNumberId}/messages";
                using var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cfg.AccessToken);
                req.Content = JsonContent.Create(new
                {
                    messaging_product = "whatsapp",
                    to = phoneE164,
                    type = "text",
                    text = new { body = message }
                });

                var res = await _http.SendAsync(req, ct);
                var json = await res.Content.ReadAsStringAsync(ct);

                if (!res.IsSuccessStatusCode)
                    return new WhatsAppSendResult { Success = false, Error = json };

                // Respuesta típica: { "messages":[{"id":"wamid.HBg..."}] }
                string? providerId = null;
                try
                {
                    using var doc = JsonDocument.Parse(json);
                    providerId = doc.RootElement
                                    .GetProperty("messages")[0]
                                    .GetProperty("id")
                                    .GetString();
                }
                catch { /* si cambia el shape, igual marcamos Success */ }

                return new WhatsAppSendResult
                {
                    Success = true,
                    ProviderMessageId = providerId
                };
            }
            catch (Exception ex)
            {
                return new WhatsAppSendResult { Success = false, Error = ex.Message };
            }
        }
    }
}
