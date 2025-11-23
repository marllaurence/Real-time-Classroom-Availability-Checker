import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

type ModalType = 'success' | 'error' | 'info';

interface CustomModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
  cancelText?: string; // <--- THIS IS THE MISSING PART YOU NEED
}

export default function CustomModal({ 
  visible, 
  type, 
  title, 
  message, 
  onClose,
  actionText = "OK",
  onAction,
  cancelText
}: CustomModalProps) {

  // Dynamic Colors based on Type
  const getColors = () => {
    switch (type) {
      case 'success': return { bg: '#ecfdf5', icon: '#10b981', iconName: 'check-circle' }; // Green
      case 'error':   return { bg: '#fef2f2', icon: '#ef4444', iconName: 'error' };        // Red
      default:        return { bg: '#eff6ff', icon: '#137fec', iconName: 'info' };         // Blue
    }
  };

  const { bg, icon, iconName } = getColors();

  const handlePress = () => {
    if (onAction) onAction();
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Icon Header */}
          <View style={[styles.iconCircle, { backgroundColor: bg }]}>
            <MaterialIcons name={iconName as any} size={40} color={icon} />
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Main Action Button */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: icon }]} 
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </TouchableOpacity>

          {/* Cancel Button (Only shows if cancelText is provided) */}
          {cancelText && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 4, 
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  }
});