import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClassActionModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  data: any; // The schedule item object
}

export default function ClassActionModal({ visible, onClose, onEdit, onDelete, data }: ClassActionModalProps) {
  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.colorStrip} />
              <Text style={styles.subjectText}>{data.subject}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#5f6368" />
            </TouchableOpacity>
          </View>

          {/* BODY DETAILS */}
          <View style={styles.body}>
            
            {/* Time */}
            <View style={styles.row}>
              <MaterialIcons name="access-time" size={20} color="#5f6368" style={styles.icon} />
              <View>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.value}>{data.startTime} - {data.endTime}</Text>
              </View>
            </View>

            {/* Professor */}
            <View style={styles.row}>
              <MaterialIcons name="person-outline" size={20} color="#5f6368" style={styles.icon} />
              <View>
                <Text style={styles.label}>Instructor</Text>
                <Text style={styles.value}>{data.professor || "Not Assigned"}</Text>
              </View>
            </View>

            {/* Room Name (If available) */}
            {data.roomName && (
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={20} color="#5f6368" style={styles.icon} />
                <View>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value}>{data.roomName}</Text>
                </View>
              </View>
            )}
          </View>

          {/* FOOTER ACTIONS */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
              <MaterialIcons name="edit" size={18} color="#1a73e8" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <MaterialIcons name="delete-outline" size={18} color="#d93025" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorStrip: {
    width: 6,
    height: 24,
    backgroundColor: '#ef4444', // Red accent
    borderRadius: 3,
    marginRight: 12,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginTop: -4,
    marginRight: -4
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center'
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  value: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500'
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 12,
    backgroundColor: '#fafafa'
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginRight: 8,
    gap: 6
  },
  editBtnText: {
    color: '#1a73e8',
    fontWeight: '600',
    fontSize: 15
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginLeft: 8,
    gap: 6
  },
  deleteBtnText: {
    color: '#d93025',
    fontWeight: '600',
    fontSize: 15
  }
});