using ctp_docente_portal.Server.Models;

public interface INotificationService
{
    Task QueueAbsenceMessageAsync(Attendance attendance);
}
