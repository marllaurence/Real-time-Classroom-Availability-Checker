import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../../components/CustomModal';
import DailyTimeline from '../../components/DailyTimeline';
import WeekCalendar from '../../components/WeekCalendar';
import { deleteSchedule, getRoomSchedules } from '../../services/schedule';
import { getRoomStatus } from '../../services/status';

// Helper: Map keywords to icons
const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase().trim();
  if (n.includes('wifi') || n.includes('internet')) return 'wifi';
  if (n.includes('projector')) return 'videocam';
  if (n.includes('tv') || n.includes('monitor')) return 'tv';
  if (n.includes('ac') || n.includes('air')) return 'ac-unit';
  if (n.includes('computer') || n.includes('pc')) return 'computer';
  if (n.includes('sound') || n.includes('speaker')) return 'volume-up';
  if (n.includes('whiteboard') || n.includes('board')) return 'edit';
  return 'check-circle'; // Default
};

export default function RoomDetails() {
  const router = useRouter();
  const { roomId, roomName, roomCapacity, roomType, equipment } = useLocalSearchParams(); 
  
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [currentStatus, setCurrentStatus] = useState<any>(null); 

  const amenities = equipment ? (equipment as string).split(',').filter(Boolean) : [];

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (today !== 'Saturday' && today !== 'Sunday') setSelectedDay(today);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDay]) 
  );

  const loadData = () => {
    const id = Number(roomId);
    const data = getRoomSchedules(id);
    setAllSchedules(data);
    setCurrentStatus(getRoomStatus(id));
    const filtered = data.filter(item => item.dayOfWeek === selectedDay);
    setFilteredSchedules(filtered);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    const filtered = allSchedules.filter(item => item.dayOfWeek === day);
    setFilteredSchedules(filtered);
  };

  const handleEventPress = (item: any) => {
    setSelectedScheduleId(item.id);
    setModalType('error'); 
    setModalTitle('Remove Class?'); 
    setModalMessage(`Remove ${item.subject} (${item.startTime})?`); 
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedScheduleId) {
      deleteSchedule(selectedScheduleId);
      loadData(); 
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#004aad" />
      <CustomModal 
        visible={modalVisible} 
        type={modalType as any} 
        title={modalTitle} 
        message={modalMessage} 
        actionText="Remove" 
        cancelText={modalType === 'error' ? "Cancel" : undefined} 
        onClose={() => setModalVisible(false)} 
        onAction={confirmDelete} 
      />

      <SafeAreaView edges={['top', 'left', 'right']}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#004aad" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{roomName}</Text>
            <Text style={styles.headerSubtitle}>{roomType} • Capacity: {roomCapacity}</Text>
          </View>
          <View style={{ width: 40 }} /> 
        </View>
        <WeekCalendar selectedDay={selectedDay} onSelectDay={handleDaySelect} />
      </SafeAreaView>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          {/* Status Banner */}
          {currentStatus && (
            <View style={[styles.statusBanner, { backgroundColor: currentStatus.color }]}>
              <MaterialIcons name={currentStatus.status === 'Available' ? "check-circle" : "access-time-filled"} size={18} color="white" />
              <Text style={styles.statusBannerText}>{currentStatus.status}</Text>
            </View>
          )}

          {/* Improved Amenities Section */}
          {amenities.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>ROOM EQUIPMENT</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((item, index) => (
                  <View key={index} style={styles.amenityChip}>
                    <View style={styles.amenityIconBox}>
                      <MaterialIcons name={getAmenityIcon(item) as any} size={16} color="#004aad" />
                    </View>
                    <Text style={styles.amenityText}>{item.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.sectionHeader, { marginLeft: 20, marginTop: 10 }]}>SCHEDULE</Text>
          <DailyTimeline schedules={filteredSchedules} onEventPress={handleEventPress} />
        
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push({ pathname: '/admin/add-schedule', params: { roomId, roomName } } as any)}>
        <MaterialIcons name="add" size={28} color="#fff" />
        <Text style={styles.fabText}>Add Class</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#004aad' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12 },
  headerTextContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  headerSubtitle: { fontSize: 12, color: '#dbeafe', marginTop: 2 },
  
  body: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 15 },
  
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, marginHorizontal: 20, marginBottom: 15, borderRadius: 12, gap: 6 },
  statusBannerText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  /* Amenities Styles */
  sectionContainer: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#f8fafc', padding: 15, borderRadius: 16 },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 10, letterSpacing: 0.5 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#ffffff', 
    paddingVertical: 6, paddingRight: 12, paddingLeft: 6, 
    borderRadius: 20, 
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, shadowOffset: {width:0, height:1}
  },
  amenityIconBox: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e0f2fe', 
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8
  },
  amenityText: { fontSize: 12, fontWeight: '600', color: '#334155' },

  fab: { position: 'absolute', bottom: 30, right: 24, backgroundColor: '#004aad', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 32, elevation: 8 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});