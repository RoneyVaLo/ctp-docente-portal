namespace ctp_docente_portal.Server.Helpers
{
    public static class DateHelper
    {
        public static bool IsWeekday(DateTime date)
        {
            return date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday;
        }

        public static bool IsValidEditDate(DateTime date)
        {
            var today = DateTime.UtcNow.Date;
            var difference = today - date.Date;
            return difference.TotalDays <= 7;
        }
    }
}
