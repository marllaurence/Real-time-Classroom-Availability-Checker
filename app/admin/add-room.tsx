import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../../components/CustomModal';
import { addClassroom, updateClassroom } from '../../services/classroom';

const STATUS_OPTIONS = ['Available', 'Maintenance', 'Reserved'];
const EQUIPMENT_OPTIONS = ['Projector', 'Smart TV', 'Whiteboard', 'AC', 'Computer', 'Sound System', 'WiFi'];

export default function AddRoom() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const isEditing = !!params.id; 

  const [name, setName] = useState(params.name as string || '');
  const [capacity, setCapacity] = useState(params.capacity ? String(params.capacity) : '');
  const [type, setType] = useState(params.type as string || ''); 
  const [status, setStatus] = useState(params.status as string || 'Available');
  
  const initialEquipment = params.equipment ? (params.equipment as string).split(',') : [];
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialEquipment);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: 'success' | 'error', title: string, msg: string) => {
    setModalType(type); setModalTitle(title); setModalMessage(msg); setModalVisible(true);
  };

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleSave = async () => {
    const equipmentString = selectedEquipment.join(','); 
    let result;
    if (isEditing) {
      result = await updateClassroom(Number(params.id), name, capacity, type, status, equipmentString);
    } else {
      result = await addClassroom(name, capacity, type, equipmentString);
    }

    if (result.success) showModal('success', isEditing ? 'Updated!' : 'Room Added!', 'Operation successful.');
    else showModal('error', 'Error', result.message || 'Failed operation.');
  };

  const onModalClose = () => { setModalVisible(false); if (modalType === 'success') router.back(); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} onAction={onModalClose} actionText="Done" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#002855" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Room' : 'Add New Room'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Room Name</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="meeting-room" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="e.g. 101-A" placeholderTextColor="#8fabc2" value={name} onChangeText={setName} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capacity</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="groups" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Number of seats" placeholderTextColor="#8fabc2" keyboardType="numeric" value={capacity} onChangeText={setCapacity} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="category" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="e.g. Lecture Hall" placeholderTextColor="#8fabc2" value={type} onChangeText={setType} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amenities & Equipment</Text>
          <View style={styles.chipContainer}>
            {EQUIPMENT_OPTIONS.map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, selectedEquipment.includes(item) && styles.chipActive]} onPress={() => toggleEquipment(item)}>
                {selectedEquipment.includes(item) && <MaterialIcons name="check" size={16} color="#fff" style={{marginRight: 4}} />}
                <Text style={[styles.chipText, selectedEquipment.includes(item) && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isEditing && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Status</Text>
            <View style={styles.statusContainer}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt} style={[styles.statusChip, status === opt && styles.statusChipActive]} onPress={() => setStatus(opt)}>
                  <Text style={[styles.statusText, status === opt && styles.statusTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#e6f2ff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#002855' },
  container: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#002855', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 16, height: 56, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#002855', height: '100%' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#bfdbfe' },
  chipActive: { backgroundColor: '#38b6ff', borderColor: '#38b6ff' },
  chipText: { color: '#5b7c99', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  statusContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statusChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#dbeafe', borderWidth: 1, borderColor: '#bfdbfe' },
  statusChipActive: { backgroundColor: '#004aad', borderColor: '#004aad' },
  statusText: { color: '#5b7c99', fontWeight: '700' },
  statusTextActive: { color: '#fff' },
  btnPrimary: { backgroundColor: '#004aad', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: '#004aad', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});