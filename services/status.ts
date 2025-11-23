import { runQuery } from '../db/database'; // Import DB access
import { getRoomSchedules } from './schedule';

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return -1;
  
  // Clean string
  const cleanStr = timeStr.trim().toLowerCase().replace(/\s+/g, ' ');
  const [time, period] = cleanStr.split(' ');

  if (!time || !period) return -1;

  let [hours, minutes] = time.split(':').map(Number);

  // Convert 12h -> 24h
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export const getRoomStatus = (roomId: number) => {
  // 1. CHECK MANUAL DATABASE STATUS FIRST
  // We need to fetch the room's manual status setting
  const roomData = runQuery('SELECT status FROM classrooms WHERE id = ?', [roomId]);
  const manualStatus = roomData[0]?.status;

  // If Admin marked it as Maintenance or Reserved, override everything
  if (manualStatus === 'Maintenance') {
    return { status: 'Maintenance', color: '#f59e0b', message: 'Under Repair' }; // Orange
  }
  if (manualStatus === 'Reserved') {
    return { status: 'Reserved', color: '#ef4444', message: 'Special Event' }; // Red
  }

  // 2. IF MANUAL STATUS IS "AVAILABLE", CHECK SCHEDULE
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const currentDay = days[now.getDay()]; 
  const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

  const schedules = getRoomSchedules(roomId);

  const activeClass = schedules.find(schedule => {
    const dbDay = schedule.dayOfWeek.trim().toLowerCase();
    
    if (dbDay !== currentDay.toLowerCase()) {
      return false; 
    }

    const start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);

    return currentMinutesTotal >= start && currentMinutesTotal < end;
  });

  if (activeClass) {
    return {
      status: 'Occupied',
      color: '#ef4444', // Red
      message: `Class: ${activeClass.subject}`,
    };
  } else {
    return {
      status: 'Available',
      color: '#10b981', // Green
      message: 'Free to use',
    };
  }
};