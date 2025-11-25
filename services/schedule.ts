import { runQuery, runTransaction } from '../db/database';

// Helper: Convert "09:00 AM" to minutes
const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return -1;
  const cleanStr = timeStr.trim().toLowerCase().replace(/\s+/g, ' ');
  const [time, period] = cleanStr.split(' ');
  if (!time || !period) return 0;
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const addSchedule = async (roomId: number, subject: string, professor: string, day: string, start: string, end: string) => {
  try {
    if (!subject || !professor || !day || !start || !end) {
      return { success: false, message: 'All fields are required' };
    }
    const newStart = timeToMinutes(start);
    const newEnd = timeToMinutes(end);

    if (newStart >= newEnd) {
      return { success: false, message: 'End time must be after start time' };
    }

    // Check for Conflicts
    const existingSchedules = runQuery('SELECT * FROM schedules WHERE room_id = ? AND dayOfWeek = ?', [roomId, day]);

    for (const schedule of existingSchedules) {
      const existingStart = timeToMinutes(schedule.startTime);
      const existingEnd = timeToMinutes(schedule.endTime);

      if (newStart < existingEnd && newEnd > existingStart) {
        return { success: false, message: `Conflict with ${schedule.subject} (${schedule.startTime} - ${schedule.endTime})` };
      }
    }

    runTransaction(
      'INSERT INTO schedules (room_id, subject, professor, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)',
      [roomId, subject, professor, day, start, end]
    );

    return { success: true, message: 'Class scheduled successfully' };
  } catch (error) {
    return { success: false, message: 'Database error: ' + error };
  }
};

export const getRoomSchedules = (roomId: number) => {
  try {
    return runQuery('SELECT * FROM schedules WHERE room_id = ? ORDER BY dayOfWeek, startTime', [roomId]);
  } catch (error) { return []; }
};

// NEW: Get Schedules for a specific room on a specific day (Sorted)
export const getSchedulesByDay = (roomId: number, day: string) => {
  try {
    const all = runQuery('SELECT * FROM schedules WHERE room_id = ? AND dayOfWeek = ?', [roomId, day]);
    return all.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  } catch (error) { return []; }
};

export const deleteSchedule = (id: number) => {
  try {
    runTransaction('DELETE FROM schedules WHERE id = ?', [id]);
    return { success: true };
  } catch (error) { return { success: false, message: error }; }
};