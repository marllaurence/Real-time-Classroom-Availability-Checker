import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaintenanceActionModal from '../../components/MaintenanceActionModal'; // Ensure this component exists
import { getMaintenanceTickets, MaintenanceTicket, updateTicketStatus } from '../../services/maintenance';

const URGENCY_COLORS: any = {
  'Critical': '#b91c1c',
  'High': '#ef4444',
  'Medium': '#f97316',
  'Low': '#10b981'
};

const STATUS_COLORS: any = {
  'Pending': '#ef4444',
  'In Progress': '#3b82f6',
  'Resolved': '#10b981'
};

export default function MaintenanceInbox() {
  const router = useRouter();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  const loadData = () => {
    const data = getMaintenanceTickets();
    // Sort: Pending/Critical first, Resolved last
    const sorted = [...data].sort((a, b) => {
      if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
      if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
      // Secondary sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setTickets(sorted);
  };

  const handleTicketPress = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  const updateStatus = (id: number, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
    updateTicketStatus(id, newStatus);
    loadData(); // Refresh list to update colors/sorting
  };

  const renderTicket = ({ item }: { item: MaintenanceTicket }) => {
    const urgencyColor = URGENCY_COLORS[item.urgency] || '#9ca3af';
    const isResolved = item.status === 'Resolved';

    return (
      <TouchableOpacity 
        style={[styles.card, isResolved && styles.cardResolved]}
        activeOpacity={0.9}
        onPress={() => handleTicketPress(item)}
      >
        {/* Left Color Strip indicating Urgency */}
        <View style={[styles.urgencyStrip, { backgroundColor: urgencyColor }]} />
        
        <View style={styles.cardContent}>
          {/* Header: Category Badge & Date */}
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <MaterialIcons name="label" size={12} color="#6b7280" />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>

          {/* Main Summary */}
          <Text style={styles.summaryText}>{item.summary}</Text>
          
          {/* Description Snippet */}
          <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>

          {/* AI Suggestion Highlight */}
          <View style={styles.suggestionBox}>
            <MaterialIcons name="lightbulb" size={14} color="#d97706" />
            <Text style={styles.suggestionText} numberOfLines={1}>Fix: {item.suggestedAction}</Text>
          </View>

          {/* Footer: Status Pill */}
          <View style={styles.footer}>
            <View style={[styles.statusBadge, { borderColor: STATUS_COLORS[item.status] }]}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
            </View>
            
            {item.urgency === 'Critical' && !isResolved && (
              <View style={styles.criticalBadge}>
                <MaterialIcons name="error" size={14} color="#fff" />
                <Text style={styles.criticalText}>URGENT</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004aad" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        
        {/* Action Modal Injection */}
        <MaintenanceActionModal 
          visible={modalVisible}
          ticket={selectedTicket}
          onClose={() => setModalVisible(false)}
          onUpdateStatus={(id: number, status: 'Pending' | 'In Progress' | 'Resolved') => {
    updateStatus(id, status);
    setModalVisible(false);
  }}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#004aad" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maintenance Inbox</Text>
          <View style={{width: 40}} />
        </View>

        {/* Ticket List */}
        <View style={styles.body}>
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTicket}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="check-circle" size={60} color="#d1fae5" />
                <Text style={styles.emptyText}>All systems operational!</Text>
                <Text style={styles.emptySubText}>No pending reports.</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004aad' },
  safeArea: { flex: 1 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#f3f4f6' 
  },
  backBtn: { backgroundColor: '#fff', padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },

  body: { flex: 1, backgroundColor: '#f3f4f6' },
  listContent: { padding: 20, paddingBottom: 40 },

  /* Ticket Card */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  cardResolved: { opacity: 0.6 },
  urgencyStrip: { width: 6 },
  
  cardContent: { flex: 1, padding: 16 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#4b5563', textTransform: 'uppercase' },
  dateText: { fontSize: 11, color: '#9ca3af' },

  summaryText: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  descText: { fontSize: 13, color: '#6b7280', marginBottom: 12 },

  suggestionBox: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: '#fff7ed', padding: 8, borderRadius: 8, marginBottom: 12 
  },
  suggestionText: { fontSize: 12, color: '#c2410c', fontWeight: '600', flex: 1 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },

  criticalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#b91c1c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  criticalText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  /* Empty State */
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#065f46' },
  emptySubText: { fontSize: 14, color: '#6b7280' }
});