import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { analyzeMaintenanceIssue, MaintenanceAnalysis } from '../services/aiSearch';
import { addMaintenanceTicket } from '../services/maintenance';

interface MaintenanceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MaintenanceModal({ visible, onClose }: MaintenanceModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MaintenanceAnalysis | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [ticketId, setTicketId] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const analysis = await analyzeMaintenanceIssue(text);
    setLoading(false);
    
    if (analysis) {
      setResult(analysis);
    } else {
      Alert.alert("AI Error", "Could not analyze the issue. Please try again.");
    }
  };

  const handleSubmit = () => {
    if (result) {
      const response = addMaintenanceTicket(text, result);
      setTicketId(response.ticket.id);
      setIsSuccess(true);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setResult(null);
    setText('');
    setTicketId(null);
    onClose();
  };

  const getUrgencyColor = (level: string) => {
    switch(level) {
      case 'Critical': return '#b91c1c';
      case 'High': return '#ef4444'; 
      case 'Medium': return '#f97316'; 
      default: return '#10b981'; 
    }
  };

  const renderSuccessView = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconRing}>
        <View style={styles.successIconCircle}>
          <MaterialIcons name="check" size={40} color="#fff" />
        </View>
      </View>
      <Text style={styles.successTitle}>Request Received!</Text>
      <Text style={styles.successSubtitle}>The maintenance team has been notified.</Text>
      <View style={styles.ticketCard}>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>TICKET ID</Text>
          <Text style={styles.ticketValue}>#{ticketId || '0000'}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: '#e5e7eb' }]} />
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>ISSUE</Text>
          <Text style={styles.ticketValue} numberOfLines={1}>{result?.summary}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: '#e5e7eb' }]} />
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>PRIORITY</Text>
          <Text style={[styles.ticketValue, { color: getUrgencyColor(result?.urgency || 'Low') }]}>
            {result?.urgency.toUpperCase()}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.successCloseBtn} onPress={handleClose}>
        <Text style={styles.btnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFormView = () => (
    <>
      <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
          <View style={styles.iconBg}>
            <MaterialIcons name="build" size={20} color="#c2410c" />
          </View>
          <Text style={styles.title}>Report Issue</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {!result && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Describe the problem naturally:</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. 'The AC in Lab 1 is leaking water...'"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
                <MaterialIcons name="auto-awesome" size={18} color="#fff" />
                <Text style={styles.btnText}>AI Analyze & Report</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.aiLabel}>AI Analysis Result</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.resultLabel}>Category</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{result.category}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.resultLabel}>Urgency</Text>
            <View style={[styles.pill, { backgroundColor: getUrgencyColor(result.urgency) + '20' }]}>
              <Text style={[styles.pillText, { color: getUrgencyColor(result.urgency) }]}>
                {result.urgency}
              </Text>
            </View>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>{result.summary}</Text>
            <Text style={styles.actionText}>Suggested: {result.suggestedAction}</Text>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Confirm & Submit Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setResult(null)} style={{alignSelf:'center', marginTop:12}}>
            <Text style={{color:'#9ca3af', fontSize:12}}>Edit Description</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {isSuccess ? renderSuccessView() : renderFormView()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ffedd5', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  inputContainer: { gap: 12 },
  label: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e5e7eb', fontSize: 16, color: '#1f2937' },
  analyzeBtn: { backgroundColor: '#004aad', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitBtn: { backgroundColor: '#ea580c', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { gap: 12 },
  resultHeader: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 8, marginBottom: 4 },
  aiLabel: { fontSize: 12, fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 15, color: '#4b5563', fontWeight: '600' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  pillText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  summaryBox: { backgroundColor: '#fff7ed', padding: 16, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#ffedd5' },
  summaryTitle: { fontSize: 12, color: '#9a3412', fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  summaryText: { fontSize: 16, color: '#1f2937', fontWeight: '600', marginBottom: 8 },
  actionText: { fontSize: 13, color: '#ea580c', fontStyle: 'italic' },
  successContainer: { alignItems: 'center', paddingVertical: 10 },
  successIconRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#065f46', marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  ticketCard: { width: '100%', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 24 },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  divider: { height: 1, width: '100%' },
  ticketLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5 },
  ticketValue: { fontSize: 14, fontWeight: '600', color: '#374151', maxWidth: '70%', textAlign: 'right' },
  successCloseBtn: { width: '100%', backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#10b981', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
});