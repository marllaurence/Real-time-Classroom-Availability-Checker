import { runQuery } from '../db/database';
import { getRoomSchedules } from './schedule';

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return -1;
  const cleanStr = timeStr.trim().toLowerCase().replace(/\s+/g, ' ');
  const [time, period] = cleanStr.split(' ');
  if (!time || !period) return -1;
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

// Updated to accept 'selectedDay'
export const getRoomStatus = (roomId: number, selectedDay?: string) => {
  // 1. Check Manual Status First
  const roomData = runQuery('SELECT status FROM classrooms WHERE id = ?', [roomId]);
  const manualStatus = roomData[0]?.status;

  if (manualStatus === 'Maintenance') return { status: 'Maintenance', color: '#f59e0b', message: 'Under Repair' };
  if (manualStatus === 'Reserved') return { status: 'Reserved', color: '#ef4444', message: 'Special Event' };

  // 2. Check Schedule
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Use selectedDay if provided, otherwise use today's real day
  const dayToCheck = selectedDay || days[now.getDay()]; 
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const schedules = getRoomSchedules(roomId);

  const activeClass = schedules.find(schedule => {
    const dbDay = schedule.dayOfWeek.trim().toLowerCase();
    
    // Check if schedule matches the day we are looking at
    if (dbDay !== dayToCheck.toLowerCase()) return false; 

    const start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);

    // Check time overlap
    return currentMinutes >= start && currentMinutes < end;
  });

  if (activeClass) {
    return {
      status: 'Occupied',
      color: '#ef4444', // Red
      message: `Occupied by ${activeClass.subject}`,
    };
  } else {
    return {
      status: 'Available',
      color: '#10b981', // Green
      message: `Free on ${dayToCheck}`,
    };
  }
};