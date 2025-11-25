import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BookingIntent, parseBookingIntent } from '../services/aiSearch';

interface AiScheduleInputProps {
  onAiFill: (data: BookingIntent) => void;
}

export default function AiScheduleInput({ onAiFill }: AiScheduleInputProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicFill = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    const result = await parseBookingIntent(query);
    setLoading(false);

    if (result) {
      onAiFill(result);
      // Optional: Clear query after success
      // setQuery(''); 
    } else {
      Alert.alert("AI Error", "Could not understand the details. Please be more specific.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MaterialIcons name="auto-awesome" size={18} color="#8b5cf6" />
        <Text style={styles.label}>AI Magic Fill</Text>
      </View>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 'Java class in Lab 2 Mon 9-11am with Prof. Smith'"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          multiline={false}
        />
        
        <TouchableOpacity 
          style={styles.magicBtn} 
          onPress={handleMagicFill}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Type natural sentences to auto-fill the form below.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#f5f3ff', // Light purple/indigo tint
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    paddingRight: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 50
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  magicBtn: {
    backgroundColor: '#8b5cf6', // Violet
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3
  },
  hint: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic'
  }
});