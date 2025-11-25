import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeekCalendarProps {
  selectedDay: string; 
  onSelectDay: (day: string) => void;
}

const getDayAbbreviation = (fullDayName: string) => {
  switch (fullDayName) {
    case 'Thursday': return 'Th';
    case 'Saturday': return 'Sa';
    case 'Sunday': return 'Su'; 
    default: return fullDayName.charAt(0); 
  }
};

export default function WeekCalendar({ selectedDay, onSelectDay }: WeekCalendarProps) {
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    const nextDays = [];
    const today = new Date();
    
    // CHANGED: Loop only 7 times
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const fullDay = date.toLocaleDateString('en-US', { weekday: 'long' });

      nextDays.push({
        dayName: getDayAbbreviation(fullDay), 
        dayNumber: date.getDate(),
        fullDay: fullDay,
        isToday: i === 0,
      });
    }
    setDays(nextDays);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {days.map((item, index) => {
          const isSelected = item.fullDay === selectedDay;
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
              onPress={() => onSelectDay(item.fullDay)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayNameText, isSelected && styles.selectedText]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dayNumText, isSelected && styles.selectedText]}>
                {item.dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 5,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 8, 
  },
  dayBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, 
    height: 56, 
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', // Translucent on Blue
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dayBtnActive: {
    backgroundColor: '#fff', 
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  dayNameText: {
    fontSize: 11,
    color: '#dbeafe', // Light Blue text
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumText: {
    fontSize: 15,
    color: '#fff', // White text
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#004aad', // Dark Blue text when active
  },
});