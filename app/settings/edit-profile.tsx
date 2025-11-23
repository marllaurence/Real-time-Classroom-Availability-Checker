import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from '../../services/auth';
import CustomModal from '../../components/CustomModal';

export default function EditProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => { loadUser(); }, []);
  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) { const user = JSON.parse(userStr); setUserId(user.id); setFullName(user.fullName); setEmail(user.email); }
  };

  const showModal = (type: 'success' | 'error', title: string, msg: string) => { setModalType(type); setModalTitle(title); setModalMessage(msg); setModalVisible(true); };

  const handleSave = async () => {
    if (!userId) return;
    const result = await updateUser(userId, fullName, email, password);
    if (result.success && result.user) {
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      showModal('success', 'Profile Updated', 'Changes saved successfully.');
    } else {
      showModal('error', 'Update Failed', result.message || 'Error.');
    }
  };

  const onModalClose = () => { setModalVisible(false); if (modalType === 'success') router.back(); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} onAction={onModalClose} actionText="Done" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#002855" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your Name" placeholderTextColor="#8fabc2" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="mail" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="#8fabc2" keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>CHANGE PASSWORD</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color="#38b6ff" style={styles.inputIcon} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="New Password" placeholderTextColor="#8fabc2" secureTextEntry />
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
          <Text style={styles.btnText}>Save Changes</Text>
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
  divider: { height: 1, backgroundColor: '#bfdbfe', marginVertical: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#002855', marginBottom: 16, letterSpacing: 1 },
  btnPrimary: { backgroundColor: '#004aad', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#004aad', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});