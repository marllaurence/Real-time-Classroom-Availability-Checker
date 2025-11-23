import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoomSchedules } from '../../services/schedule';
import { getRoomStatus } from '../../services/status';

export default function UserRoomDetails() {
  const router = useRouter();
  const { roomId, roomName, roomType, roomCapacity, equipment } = useLocalSearchParams(); 
  const [schedules, setSchedules] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<any>(null);

  const amenities = equipment ? (equipment as string).split(',').filter(Boolean) : [];

  useFocusEffect(useCallback(() => {
    const id = Number(roomId);
    setSchedules(getRoomSchedules(id));
    setCurrentStatus(getRoomStatus(id));
  }, []));

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>{item.startTime}</Text>
        <Text style={styles.timeSub}>to</Text>
        <Text style={styles.timeText}>{item.endTime}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.prof}>{item.professor}</Text>
        <View style={styles.dayContainer}><MaterialIcons name="calendar-today" size={12} color="#5b7c99" /><Text style={styles.dayBadge}>{item.dayOfWeek}</Text></View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004aad" />
      
      {/* BOLD HEADER */}
      <View style={styles.headerContainer}>
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
        </SafeAreaView>
      </View>

      {currentStatus && (
        <View style={[styles.statusBanner, { backgroundColor: currentStatus.color }]}>
          <MaterialIcons name={currentStatus.status === 'Available' ? "check-circle" : "access-time-filled"} size={24} color="white" />
          <Text style={styles.statusBannerText}>Current Status: {currentStatus.status}</Text>
        </View>
      )}

      {/* AMENITIES SECTION */}
      {amenities.length > 0 && (
        <View style={styles.amenitiesContainer}>
          <Text style={styles.sectionHeader}>Amenities</Text>
          <View style={styles.chipRow}>
            {amenities.map((item, index) => (
              <View key={index} style={styles.chip}>
                <MaterialIcons name="check" size={14} color="#004aad" style={{marginRight: 4}} />
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <FlatList 
        data={schedules} keyExtractor={item => item.id.toString()} renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Weekly Schedule</Text>}
        ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyText}>No classes scheduled.</Text><Text style={styles.emptySubText}>This room is free all week!</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f2ff' },
  headerContainer: { backgroundColor: '#004aad', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 20, marginBottom: 5, shadowColor: '#004aad', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 3 },
  headerTextContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#dbeafe', opacity: 0.9, marginTop: 2 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginHorizontal: 20, marginTop: 15, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3, gap: 8 },
  statusBannerText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  amenitiesContainer: { marginHorizontal: 20, marginTop: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#9ca3af', marginBottom: 8, letterSpacing: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#004aad' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, marginTop: 20, color: '#002855' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, color: '#002855', fontWeight: '600' },
  emptySubText: { fontSize: 14, color: '#5b7c99', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#004aad', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f0f9ff' },
  timeBox: { alignItems: 'center', justifyContent: 'center', marginRight: 16, width: 75, borderRightWidth: 1, borderRightColor: '#e6f2ff', paddingRight: 10 },
  timeText: { fontWeight: 'bold', color: '#002855', fontSize: 13, textAlign: 'center' },
  timeSub: { fontSize: 10, color: '#9ca3af', marginVertical: 2 },
  details: { flex: 1, paddingLeft: 6 },
  subject: { fontSize: 16, fontWeight: 'bold', color: '#004aad' },
  prof: { fontSize: 14, color: '#5b7c99', marginTop: 2 },
  dayContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  dayBadge: { fontSize: 12, color: '#5b7c99', fontWeight: '500' },
});