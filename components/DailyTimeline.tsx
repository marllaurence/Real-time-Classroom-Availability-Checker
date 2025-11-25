import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const HOUR_HEIGHT = 70; // Height of one hour slot
const START_HOUR = 7;   // Start timeline at 7:00 AM
const END_HOUR = 19;    // End timeline at 7:00 PM

interface ScheduleItem {
  id: number;
  startTime: string; 
  endTime: string;   
  subject: string;
  professor: string;
}

interface DailyTimelineProps {
  schedules: ScheduleItem[];
  onEventPress?: (item: ScheduleItem) => void; 
}

// Helper to parse "09:30 AM" into decimal (9.5)
const getDecimalHour = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  if (!time || !period) return 0;
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours + minutes / 60;
};

export default function DailyTimeline({ schedules, onEventPress }: DailyTimelineProps) {
  // Generate hours array [7, 8, ... 19]
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.body}>
        
        {/* --- TIME COLUMN (Left) --- */}
        <View style={styles.timeColumn}>
          {hours.map((hour) => (
            <View key={hour} style={styles.timeLabelContainer}>
              <Text style={styles.timeText}>
                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
              </Text>
            </View>
          ))}
        </View>

        {/* --- GRID COLUMN (Right) --- */}
        <View style={styles.gridColumn}>
          {/* Horizontal Grid Lines */}
          {hours.map((hour) => (
            <View key={hour} style={styles.gridLine} />
          ))}

          {/* --- SCHEDULE BLOCKS --- */}
          {schedules.map((item) => {
            const start = getDecimalHour(item.startTime);
            const end = getDecimalHour(item.endTime);
            
            // Calculate Position (Top) and Height
            const top = (start - START_HOUR) * HOUR_HEIGHT;
            const height = (end - start) * HOUR_HEIGHT;

            if (top < 0) return null; 

            return (
              <TouchableOpacity 
                key={item.id}
                style={[
                  styles.eventBlock, 
                  { top, height: Math.max(height, 35) } 
                ]}
                onPress={() => onEventPress && onEventPress(item)}
                activeOpacity={0.9}
              >
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{item.subject}</Text>
                  <Text style={styles.eventTime} numberOfLines={1}>
                    {item.startTime} - {item.endTime}
                  </Text>
                  {/* Show Professor only if block is tall enough */}
                  {height > 50 && (
                     <Text style={styles.eventProf} numberOfLines={1}>{item.professor}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { paddingBottom: 100, paddingTop: 10 },
  body: { flexDirection: 'row' },
  
  /* Left Column */
  timeColumn: { width: 60 },
  timeLabelContainer: { height: HOUR_HEIGHT, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 8 },
  timeText: { fontSize: 11, color: '#94a3b8', fontWeight: '500', transform: [{ translateY: -6 }] },

  /* Right Column */
  gridColumn: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#e2e8f0' },
  gridLine: { height: HOUR_HEIGHT, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },

  /* Event Block (Google Calendar Style) */
  eventBlock: {
    position: 'absolute',
    left: 4, right: 4,
    backgroundColor: '#0284c7', // Solid Blue
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3
  },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 13, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  eventTime: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  eventProf: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontStyle: 'italic' },
});