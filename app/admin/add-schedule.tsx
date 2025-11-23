import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView, StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../../components/CustomModal';
import { addSchedule } from '../../services/schedule';

export default function AddSchedule() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams(); 

  const [subject, setSubject] = useState('');
  const [professor, setProfessor] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endTime, setEndTime] = useState('');
  const [endPeriod, setEndPeriod] = useState('AM');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: 'success' | 'error', title: string, msg: string) => {
    setModalType(type); setModalTitle(title); setModalMessage(msg); setModalVisible(true);
  };

  const isValidTime = (time: string) => {
    const regex = /^([0-1]?[0-9]):([0-5][0-9])$/; 
    return regex.test(time);
  };

  const handleSave = async () => {
    if (!subject || !professor || !day || !startTime || !endTime) {
      showModal('error', 'Missing Info', 'Please fill in all fields.');
      return;
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      showModal('error', 'Invalid Time', 'Please use HH:MM format (e.g., 09:30).');
      return;
    }

    const fullStart = `${startTime} ${startPeriod}`;
    const fullEnd = `${endTime} ${endPeriod}`;

    const result = await addSchedule(Number(roomId), subject, professor, day, fullStart, fullEnd);
    
    if (result.success) {
      showModal('success', 'Class Scheduled!', `Added ${subject} to ${roomName}.`);
    } else {
      showModal('error', 'Conflict Detected', result.message || 'Could not save schedule.');
    }
  };

  const onModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') router.back();
  };

  const PeriodToggle = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity style={[styles.toggleBtn, value === 'AM' && styles.toggleBtnActive]} onPress={() => onChange('AM')}>
        <Text style={[styles.toggleText, value === 'AM' && styles.toggleTextActive]}>AM</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.toggleBtn, value === 'PM' && styles.toggleBtnActive]} onPress={() => onChange('PM')}>
        <Text style={[styles.toggleText, value === 'PM' && styles.toggleTextActive]}>PM</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004aad" />
      <CustomModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} onAction={onModalClose} actionText={modalType === 'success' ? "Done" : "Fix It"} />

      {/* --- BOLD HEADER --- */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#004aad" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Add Class</Text>
              <Text style={styles.headerSubtitle}>For {roomName}</Text>
            </View>
            <View style={{ width: 40 }} /> 
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject Code</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="class" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="e.g. Math 101" placeholderTextColor="#8fabc2" value={subject} onChangeText={setSubject} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Professor</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="e.g. Dr. Smith" placeholderTextColor="#8fabc2" value={professor} onChangeText={setProfessor} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Day of Week</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="calendar-today" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="e.g. Monday" placeholderTextColor="#8fabc2" value={day} onChangeText={setDay} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time</Text>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <MaterialIcons name="access-time" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="09:00" placeholderTextColor="#8fabc2" value={startTime} onChangeText={setStartTime} keyboardType="numbers-and-punctuation" />
            </View>
            <PeriodToggle value={startPeriod} onChange={setStartPeriod} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Time</Text>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <MaterialIcons name="access-time-filled" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="10:30" placeholderTextColor="#8fabc2" value={endTime} onChangeText={setEndTime} keyboardType="numbers-and-punctuation" />
            </View>
            <PeriodToggle value={endPeriod} onChange={setEndPeriod} />
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
          <Text style={styles.btnText}>Save Schedule</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f2ff' },
  
  /* Bold Header Styles */
  headerContainer: { 
    backgroundColor: '#004aad', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    paddingBottom: 20, 
    marginBottom: 10,
    shadowColor: '#004aad', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10
  },
  headerContent: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 10 
  },
  backBtn: { 
    padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 3 
  },
  headerTextContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#dbeafe', opacity: 0.9, marginTop: 2 },

  scrollContainer: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 14, fontWeight: '700', color: '#002855', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 16, height: 56, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#002855', height: '100%' },
  
  toggleContainer: { flexDirection: 'row', height: 56, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#bfdbfe' },
  toggleBtn: { width: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  toggleBtnActive: { backgroundColor: '#004aad' },
  toggleText: { fontWeight: '600', color: '#5b7c99' },
  toggleTextActive: { color: '#fff' },

  btnPrimary: { backgroundColor: '#004aad', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#004aad', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});