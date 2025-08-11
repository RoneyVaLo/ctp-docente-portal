namespace ctp_docente_portal.Server.DTOs.Notifications
{
    public sealed class SendAbsencesRequest
    {
        public DateOnly Date { get; set; }
        public int SectionId { get; set; }
    }


}
