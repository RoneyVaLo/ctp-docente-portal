Task CreateGroupAttendanceAsync(CreateGroupAttendanceDto dto);
Task UpdateAsync(UpdateAttendanceDto dto);
Task<List<Attendance>> GetAsync(AttendanceQueryDto filter);
