import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../../components/CustomModal';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const handleLogoutPress = () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/auth/login' as any);
  };

  const SettingItem = ({ icon, label, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, isDestructive && styles.iconBoxDestructive]}>
          <MaterialIcons name={icon} size={24} color={isDestructive ? '#ef4444' : '#004aad'} />
        </View>
        <Text style={[styles.itemLabel, isDestructive && styles.itemLabelDestructive]}>{label}</Text>
      </View>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {!value && <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Logout Confirmation Modal */}
      <CustomModal 
        visible={modalVisible}
        type="info"
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
        actionText="Log Out"
        cancelText="Cancel"
        onClose={() => setModalVisible(false)}
        onAction={confirmLogout}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#002855" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.[0] || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <SettingItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/settings/edit-profile' as any)} />
          <SettingItem icon="notifications-none" label="Notifications" value="On" />
          <SettingItem icon="lock-outline" label="Change Password" onPress={() => router.push('/settings/edit-profile' as any)} />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP</Text>
          <SettingItem icon="info-outline" label="Version" value="2.0.0" />
          <SettingItem icon="help-outline" label="Help & Support" />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <SettingItem 
            icon="logout" 
            label="Log Out" 
            isDestructive 
            onPress={handleLogoutPress} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#e6f2ff' }, // Light Blue Background
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#e6f2ff' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#002855' },
  container: { padding: 20 },
  
  profileSection: { alignItems: 'center', marginBottom: 30, backgroundColor: '#fff', padding: 24, borderRadius: 24, shadowColor: '#004aad', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#004aad' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#002855', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#5b7c99', marginBottom: 12 },
  roleBadge: { backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#bae6fd' },
  roleText: { fontSize: 12, fontWeight: 'bold', color: '#0284c7' },

  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#5b7c99', marginBottom: 10, marginLeft: 8, letterSpacing: 1 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconBoxDestructive: { backgroundColor: '#fef2f2' },
  itemLabel: { fontSize: 16, color: '#334155', fontWeight: '600' },
  itemLabelDestructive: { color: '#ef4444' },
  itemValue: { fontSize: 14, color: '#94a3b8' },
});