namespace ctp_docente_portal.Server.Helpers
{
    public static class MessageTemplateHelper
    {
        public static string GenerateAbsenceMessage(string studentName, DateTime date)
        {
            return $"Estimado encargado, se informa que {studentName} estuvo ausente el día {date:dd/MM/yyyy}.";
        }
    }
}
