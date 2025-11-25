import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaintenanceTicket } from '../services/maintenance';

interface MaintenanceActionModalProps {
  visible: boolean;
  ticket: MaintenanceTicket | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: 'Pending' | 'In Progress' | 'Resolved') => void;
}

export default function MaintenanceActionModal({ visible, ticket, onClose, onUpdateStatus }: MaintenanceActionModalProps) {
  if (!ticket) return null;

  const getUrgencyColor = (level: string) => {
    switch(level) {
      case 'Critical': return '#b91c1c'; 
      case 'High': return '#ef4444'; 
      case 'Medium': return '#f97316'; 
      default: return '#10b981'; 
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(ticket.urgency) }]}>
                <Text style={styles.urgencyText}>{ticket.urgency}</Text>
              </View>
              <Text style={styles.dateText}>{new Date(ticket.date).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Title */}
            <Text style={styles.summary}>{ticket.summary}</Text>
            
            {/* Category */}
            <View style={styles.row}>
              <MaterialIcons name="label-outline" size={18} color="#6b7280" />
              <Text style={styles.category}>{ticket.category}</Text>
            </View>

            <View style={styles.divider} />

            {/* Description */}
            <Text style={styles.sectionLabel}>FULL REPORT</Text>
            <Text style={styles.description}>{ticket.description}</Text>

            {/* AI Fix */}
            <View style={styles.aiBox}>
              <View style={styles.aiHeader}>
                <MaterialIcons name="auto-awesome" size={16} color="#d97706" />
                <Text style={styles.aiTitle}>AI Suggested Fix</Text>
              </View>
              <Text style={styles.aiText}>{ticket.suggestedAction}</Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Update Status:</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnPending, ticket.status === 'Pending' && styles.btnActive]} 
                onPress={() => onUpdateStatus(ticket.id, 'Pending')}
              >
                <MaterialIcons name="schedule" size={20} color={ticket.status === 'Pending' ? '#fff' : '#ef4444'} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnProgress, ticket.status === 'In Progress' && styles.btnActive]} 
                onPress={() => onUpdateStatus(ticket.id, 'In Progress')}
              >
                <MaterialIcons name="construction" size={20} color={ticket.status === 'In Progress' ? '#fff' : '#3b82f6'} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnResolved, ticket.status === 'Resolved' && styles.btnActive]} 
                onPress={() => onUpdateStatus(ticket.id, 'Resolved')}
              >
                <MaterialIcons name="check" size={20} color={ticket.status === 'Resolved' ? '#fff' : '#10b981'} />
              </TouchableOpacity>
            </View>
            <View style={styles.labelRow}>
               <Text style={styles.btnLabel}>Pending</Text>
               <Text style={styles.btnLabel}>Doing</Text>
               <Text style={styles.btnLabel}>Done</Text>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTextContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  urgencyText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  dateText: { color: '#9ca3af', fontSize: 12 },
  closeBtn: { padding: 4 },
  body: { padding: 24 },
  summary: { fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  category: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', marginBottom: 8, letterSpacing: 1 },
  description: { fontSize: 16, color: '#374151', lineHeight: 24, marginBottom: 24 },
  aiBox: { backgroundColor: '#fff7ed', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ffedd5' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiTitle: { fontSize: 12, fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase' },
  aiText: { fontSize: 15, fontWeight: '600', color: '#9a3412' },
  footer: { backgroundColor: '#f9fafb', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  footerLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  actionBtn: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2, backgroundColor: '#fff' },
  btnPending: { borderColor: '#ef4444' },
  btnProgress: { borderColor: '#3b82f6' },
  btnResolved: { borderColor: '#10b981' },
  btnActive: { backgroundColor: '#000', borderWidth: 0 }, 
  labelRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10 },
  btnLabel: { fontSize: 11, color: '#9ca3af', width: 56, textAlign: 'center' }
});