import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView, StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../../components/CustomModal';
import { registerUser } from '../../services/auth';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: 'success' | 'error', title: string, msg: string) => {
    setModalType(type); setModalTitle(title); setModalMessage(msg); setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showModal('error', 'Missing Info', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      showModal('error', 'Mismatch', 'Passwords do not match.');
      return;
    }
    const result = await registerUser(fullName, email, password, 'user');
    if (result.success) {
      showModal('success', 'Account Created', 'Please log in now.');
    } else {
      showModal('error', 'Registration Failed', result.message || 'Error occurred.');
    }
  };

  const onModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') router.replace('/auth/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8ff" />
      <CustomModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} onAction={onModalClose} actionText="OK" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="school" size={40} color="#004aad" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Sign up to check classroom availability.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput placeholder="Your Name" placeholderTextColor="#8fabc2" style={styles.input} value={fullName} onChangeText={setFullName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="mail" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput placeholder="email@example.com" placeholderTextColor="#8fabc2" style={styles.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput placeholder="Create password" placeholderTextColor="#8fabc2" style={styles.input} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#8fabc2" /></TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputWrapper, (password !== confirmPassword && confirmPassword.length > 0) && { borderColor: '#ef4444' }]}>
              <MaterialIcons name="lock" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput placeholder="Confirm password" placeholderTextColor="#8fabc2" style={styles.input} secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#8fabc2" /></TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
            <Text style={styles.btnText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login' as any)}><Text style={styles.linkText}>Log In</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f8ff' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { backgroundColor: '#dbeafe', padding: 18, borderRadius: 24, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#002855', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: '#5b7c99', textAlign: 'center' },
  formContainer: { gap: 16 },
  inputGroup: { marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#002855', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 16, height: 56, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#002855', height: '100%' },
  btnPrimary: { backgroundColor: '#004aad', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 16, shadowColor: '#004aad', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#5b7c99', fontSize: 15 },
  linkText: { color: '#004aad', fontSize: 15, fontWeight: '700' },
});