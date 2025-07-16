using ctp_docente_portal.Server.Models;
using ctp_docente_portal.Server.Services.Interfaces;

public class WhatsAppApiService : IWhatsAppApiService
{
    public async Task<bool> SendMessageAsync(WhatsAppMessage message)
    {
        try
        {
            // Simulamos un envío real
            Console.WriteLine($"[WhatsApp API] Enviando a {message.PhoneNumber}: {message.Message}");

            await Task.Delay(500); // Simula retardo de red

            // Simulamos éxito
            return true;
        }
        catch
        {
            // Simulamos fallo
            return false;
        }
    }
}
