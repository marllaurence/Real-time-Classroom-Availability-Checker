import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../../components/CustomModal';
import { loginUser } from '../../services/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: 'success' | 'error', title: string, msg: string) => {
    setModalType(type); setModalTitle(title); setModalMessage(msg); setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('error', 'Missing Info', 'Please enter both email and password.');
      return;
    }

    const result = await loginUser(email, password);

    if (result.success && result.user) {
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      showModal('success', 'Welcome Back!', `Successfully logged in as ${result.user.fullName}`);
    } else {
      showModal('error', 'Login Failed', result.message || 'Invalid credentials');
    }
  };

  const onModalClose = async () => {
    setModalVisible(false);
    if (modalType === 'success') {
      const userStr = await AsyncStorage.getItem('user');
      if(userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') router.replace('/admin/dashboard' as any);
        else router.replace('/user/dashboard' as any); 
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#e6f2ff" />
      
      <CustomModal 
        visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage}
        onClose={() => setModalVisible(false)} onAction={onModalClose} actionText={modalType === 'success' ? "Go to Dashboard" : "Try Again"}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="lock-open" size={40} color="#004aad" />
          </View>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to access your classroom schedule.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Username</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput
                placeholder="admin or student@email.com"
                placeholderTextColor="#8fabc2"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#38b6ff" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#8fabc2"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#8fabc2" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
            <Text style={styles.btnText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#e6f2ff' }, // Light Blue Background
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { 
    backgroundColor: '#dbeafe', // Soft Blue Circle
    padding: 18, borderRadius: 24, marginBottom: 20,
    shadowColor: '#004aad', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#002855', marginBottom: 10, textAlign: 'center', letterSpacing: -0.5 }, // Navy Text
  headerSubtitle: { fontSize: 16, color: '#5b7c99', textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 }, // Blue-Grey Text
  
  formContainer: { gap: 20 },
  inputGroup: { marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#002855', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#ffffff', // White Input
    borderWidth: 1, borderColor: '#bfdbfe', // Light Blue Border
    borderRadius: 16, height: 58, paddingHorizontal: 16,
    shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 1
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#002855', height: '100%' },
  eyeIcon: { padding: 8 },
  
  btnPrimary: { 
    backgroundColor: '#004aad', // Deep Blue Button
    height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, 
    shadowColor: '#004aad', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 
  },
  btnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#5b7c99', fontSize: 15 },
  linkText: { color: '#004aad', fontSize: 15, fontWeight: '700' },
});