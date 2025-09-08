using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class WhatsAppApiSettings
    {
        public string PhoneNumberId { get; set; } = "825978877256138";  
        public string AccessToken { get; set; } = "EAALSAZBIbFYQBPaQ7fF2VDozoupq8ZBTHWwVHcRXPMsfzpu9Q0FInGG4KPJqNZCWg9ZCo8pPaaQiQWlK3YPDVwztu8vUIB7bzbpK68MxKUlU9lmujrgDaLYpWrDegeU81BhQicLgW2RlJbAb1F4HVU6VnBM7qpw7wtVJf7AgWmcjQfrQe0ESZCNlNaPfvV5VVBIxa2XJuLavVqdhlEyMWLBZAMGiEeFSqolilVOSFpdHCXZBQZDZD";  
        public string ApiVersion { get; set; } = "v22.0";

        public string? DefaultTemplateName { get; set; } = "reporte";
        public string? DefaultLanguageCode { get; set; } = "es_MX";
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
                var url = BuildMessagesUrl();
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
                    return new WhatsAppSendResult { Success = false, Error = json, RawResponse = json };

                var providerId = TryGetMessageId(json);
                return new WhatsAppSendResult { Success = true, ProviderMessageId = providerId, RawResponse = json };
            }
            catch (Exception ex)
            {
                return new WhatsAppSendResult { Success = false, Error = ex.Message };
            }
        }

        public async Task<WhatsAppSendResult> SendTemplateAsync(
            string phoneE164,
            string templateName,
            string languageCode,
            string[] bodyParameters,
            CancellationToken ct = default)
        {
            try
            {
                var url = BuildMessagesUrl();
                using var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cfg.AccessToken);

                // Construir parámetros del body en el orden {{1}}, {{2}}, {{3}}, ...
                var parameters = new object[bodyParameters.Length];
                for (int i = 0; i < bodyParameters.Length; i++)
                {
                    parameters[i] = new { type = "text", text = bodyParameters[i] ?? string.Empty };
                }

                var payload = new
                {
                    messaging_product = "whatsapp",
                    to = phoneE164,
                    type = "template",
                    template = new
                    {
                        name = templateName,
                        language = new { code = languageCode },
                        components = new object[]
                        {
                            new
                            {
                                type = "body",
                                parameters
                            }
                        }
                    }
                };

                var jsonBody = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = null,
                    WriteIndented = false
                });

                req.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                var res = await _http.SendAsync(req, ct);
                var json = await res.Content.ReadAsStringAsync(ct);

                if (!res.IsSuccessStatusCode)
                    return new WhatsAppSendResult { Success = false, Error = json, RawResponse = json };

                var providerId = TryGetMessageId(json);
                return new WhatsAppSendResult { Success = true, ProviderMessageId = providerId, RawResponse = json };
            }
            catch (Exception ex)
            {
                return new WhatsAppSendResult { Success = false, Error = ex.Message };
            }
        }

        public Task<WhatsAppSendResult> SendAbsenceTemplateAsync(
            string phoneE164,
            string studentName,
            DateOnly date,
            string? subjectName,
            int? subjectId,
            CancellationToken ct = default)
        {
            var p1 = string.IsNullOrWhiteSpace(studentName) ? "Estudiante" : studentName.Trim();
            var p2 = date.ToString("yyyy-MM-dd");
            var p3 = subjectId.HasValue
                ? (string.IsNullOrWhiteSpace(subjectName) ? $"Materia #{subjectId.Value}" : subjectName!.Trim())
                : "Sin materia";

            var templateName = _cfg.DefaultTemplateName ?? "reporte";
            var languageCode = _cfg.DefaultLanguageCode ?? "es_MX";

            return SendTemplateAsync(
                phoneE164: phoneE164,
                templateName: templateName,
                languageCode: languageCode,
                bodyParameters: new[] { p1, p2, p3 },
                ct: ct
            );
        }

        // ===== helpers =====
        private string BuildMessagesUrl() =>
            $"https://graph.facebook.com/{_cfg.ApiVersion}/{_cfg.PhoneNumberId}/messages";

        private static string? TryGetMessageId(string json)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("messages", out var msgs) &&
                    msgs.ValueKind == JsonValueKind.Array &&
                    msgs.GetArrayLength() > 0)
                {
                    var first = msgs[0];
                    if (first.TryGetProperty("id", out var idProp) &&
                        idProp.ValueKind == JsonValueKind.String)
                        return idProp.GetString();
                }
            }
            catch { /* swallow */ }
            return null;
        }
    }
}