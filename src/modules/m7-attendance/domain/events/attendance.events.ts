export const AttendanceEvents = {
  CHECK_IN: 'attendance.checkIn',
  CHECK_OUT: 'attendance.checkOut',
  LATE_ARRIVAL: 'attendance.late_arrival',
  EARLY_DEPARTURE: 'attendance.early_departure',
  ABSENT_MARKED: 'attendance.absent_marked',
  RECORD_CORRECTED: 'attendance.record_corrected',
} as const;
