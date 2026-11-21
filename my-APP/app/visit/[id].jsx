import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { getVisits, getProperties, updateVisit } from '../../services/storageService';
import { formatDate, formatTime } from '../../utils/formatDate';
import { FollowUpStatus, getFollowUpStatusLabel } from '../../constants/propertyTypes';
import { cancelVisitReminder, scheduleVisitReminder } from '../../services/notificationService';
import { generateVisitReport } from '../../utils/reportGenerator';
export default function VisitDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [visit, setVisit] = useState(null);
  const [property, setProperty] = useState(null);
  const [followUpStatus, setFollowUpStatus] = useState('NONE');
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [editDate, setEditDate] = useState(new Date());
  const [showEditDate, setShowEditDate] = useState(false);
  const [showEditTime, setShowEditTime] = useState(false);

  useEffect(() => {
    const loadVisit = async () => {
      const visits = await getVisits();
      const v = visits.find(x => x.id === id);
      if (v) {
        setVisit(v);
        if (v.followUpStatus) setFollowUpStatus(v.followUpStatus);
        if (v.followUpDate) setFollowUpDate(new Date(v.followUpDate));
        if (v.followUpNote) setFollowUpNote(v.followUpNote);
        if (v.date) setEditDate(new Date(v.date));

        const props = await getProperties();
        setProperty(props.find(p => p.id === v.propertyId));
      }
    };
    loadVisit();
  }, [id]);

  if (!visit) {
    return (
      <View style={styles.container}>
        <Header title="Visit Details" />
        <Text style={{ textAlign: 'center', marginTop: theme.spacing.xl }}>Loading...</Text>
      </View>
    );
  }

  const isCompleted = visit.status === 'Completed';
  const isScheduled = visit.status === 'Scheduled';

  const handleCancelVisit = () => {
    Alert.alert('Cancel Visit', 'Are you sure you want to cancel this visit?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        const updatedVisit = { ...visit, status: 'Cancelled' };
        const success = await updateVisit(visit.id, updatedVisit);
        if (success) {
          if (visit.notificationId) {
            await cancelVisitReminder(visit.notificationId);
          }
          setVisit(updatedVisit);
          Alert.alert('Success', 'Visit cancelled.');
        } else {
          Alert.alert('Error', 'Failed to cancel visit.');
        }
      }}
    ]);
  };

  const handleReschedule = async () => {
    if (visit.notificationId) {
      await cancelVisitReminder(visit.notificationId);
    }
    const newId = await scheduleVisitReminder(editDate.toISOString(), property?.name, visit.reminderPreference, visit.id);
    
    const updatedVisit = { ...visit, date: editDate.toISOString(), notificationId: newId || undefined };
    const success = await updateVisit(visit.id, updatedVisit);
    
    if (success) {
       setVisit(updatedVisit);
       Alert.alert('Success', 'Visit rescheduled.');
    } else {
       Alert.alert('Error', 'Failed to reschedule.');
    }
  };

  const handleSaveFollowUp = async () => {
    const updatedVisit = { 
      ...visit, 
      followUpStatus, 
      followUpDate: followUpDate.toISOString(), 
      followUpNote 
    };
    const success = await updateVisit(visit.id, updatedVisit);
    if (success) {
      setVisit(updatedVisit);
      Alert.alert('Success', 'Follow-up details saved.');
    } else {
      Alert.alert('Error', 'Failed to save follow-up details.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      await generateVisitReport(visit, property);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate visit report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Visit Details" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Status</Text>
            <StatusBadge status={visit.status} />
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Property</Text>
          <Text style={styles.value}>{property?.name || 'Unknown Property'}</Text>
          
          <View style={styles.divider} />

          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>{formatDate(visit.date)} at {formatTime(visit.date)}</Text>
          
          <View style={styles.divider} />

          <Text style={styles.label}>Agent / Visitor</Text>
          <Text style={styles.value}>{visit.agent}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Purpose</Text>
          <Text style={styles.value}>{visit.purpose || 'General Visit'}</Text>

          {visit.notes ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{visit.notes}</Text>
            </>
          ) : null}
        </View>

        {isCompleted && visit.checklist && visit.checklist.length > 0 && (
          <View style={styles.checklistCard}>
            <Text style={styles.sectionTitle}>Checklist Results</Text>
            
            {Object.entries(
              visit.checklist.reduce((acc, curr) => {
                if (!acc[curr.category]) acc[curr.category] = [];
                acc[curr.category].push(curr);
                return acc;
              }, {})
            ).map(([cat, items]) => (
              <View key={cat} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{cat}</Text>
                {items.map((item, idx) => (
                  <View key={idx} style={styles.checklistItem}>
                    <Ionicons 
                      name={item.checked ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={item.checked ? Colors.primary : Colors.textSecondary} 
                    />
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemText, !item.checked && styles.itemTextUnchecked]}>{item.item}</Text>
                      {item.note ? <Text style={styles.itemNote}>Note: {item.note}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {isCompleted && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Follow-up</Text>
            
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity 
              style={styles.dropdown} 
              onPress={() => setShowStatusModal(true)}
            >
              <Text style={styles.dropdownText}>{getFollowUpStatusLabel(followUpStatus)}</Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: theme.spacing.m }]}>Follow-up Date</Text>
            <TouchableOpacity 
              style={styles.dropdown} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dropdownText}>{formatDate(followUpDate.toISOString())}</Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={followUpDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setFollowUpDate(selectedDate);
                }}
              />
            )}

            <Text style={[styles.label, { marginTop: theme.spacing.m }]}>Notes</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Enter follow-up notes"
              value={followUpNote}
              onChangeText={setFollowUpNote}
              textAlignVertical="top"
            />

            <PrimaryButton 
              title="Save Follow-up" 
              onPress={handleSaveFollowUp} 
              style={{ marginTop: theme.spacing.m }}
            />
          </View>
        )}

        {isCompleted && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Visit Report</Text>
            <Text style={{ ...theme.typography.body2, color: Colors.textSecondary, marginBottom: theme.spacing.m }}>
              Generate a professional PDF report containing property details, checklist results, and visit notes.
            </Text>
            <PrimaryButton 
              title="Generate Visit Report" 
              onPress={handleGenerateReport} 
              loading={isGeneratingReport}
              style={{ backgroundColor: Colors.secondary }}
            />
          </View>
        )}

        {!isCompleted && (
          <PrimaryButton 
            title="Start Inspection" 
            onPress={() => router.push(`/visit/inspection?visitId=${visit.id}&propertyId=${visit.propertyId}`)} 
            style={styles.actionButton}
          />
        )}

        {isScheduled && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Manage Visit</Text>
            
            <Text style={styles.label}>Reschedule Date</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowEditDate(true)}>
              <Text style={styles.dropdownText}>{formatDate(editDate.toISOString())}</Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showEditDate && (
              <DateTimePicker
                value={editDate} mode="date" display="default"
                onChange={(e, d) => { setShowEditDate(false); if (d) setEditDate(d); }}
              />
            )}

            <Text style={[styles.label, { marginTop: theme.spacing.m }]}>Reschedule Time</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowEditTime(true)}>
              <Text style={styles.dropdownText}>{formatTime(editDate.toISOString())}</Text>
              <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showEditTime && (
              <DateTimePicker
                value={editDate} mode="time" display="default"
                onChange={(e, d) => { setShowEditTime(false); if (d) setEditDate(d); }}
              />
            )}

            <PrimaryButton title="Update Date & Time" onPress={handleReschedule} style={{ marginTop: theme.spacing.m }} />
            <PrimaryButton title="Cancel Visit" onPress={handleCancelVisit} style={{ marginTop: theme.spacing.s, backgroundColor: Colors.error || '#e74c3c' }} />
          </View>
        )}
      </ScrollView>

      <Modal visible={showStatusModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowStatusModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {Object.values(FollowUpStatus).map((status) => (
              <TouchableOpacity 
                key={status} 
                style={styles.modalItem}
                onPress={() => {
                  setFollowUpStatus(status);
                  setShowStatusModal(false);
                }}
              >
                <Text style={[styles.modalItemText, followUpStatus === status && { color: Colors.primary, fontWeight: 'bold' }]}>
                  {getFollowUpStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: theme.spacing.m },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    ...theme.shadows.small,
    marginBottom: theme.spacing.xl,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...theme.typography.body2, color: Colors.textSecondary, marginBottom: 4 },
  value: { ...theme.typography.h4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: theme.spacing.m },
  actionButton: { marginTop: theme.spacing.m },
  checklistCard: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    ...theme.shadows.small,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: { ...theme.typography.h3, marginBottom: theme.spacing.m },
  categorySection: { marginBottom: theme.spacing.m },
  categoryTitle: { ...theme.typography.h4, color: Colors.primary, marginBottom: theme.spacing.s },
  checklistItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.s },
  itemContent: { marginLeft: theme.spacing.s, flex: 1 },
  itemText: { ...theme.typography.body1, color: Colors.text },
  itemTextUnchecked: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  itemNote: { ...theme.typography.body2, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.s,
    backgroundColor: Colors.background,
  },
  dropdownText: { ...theme.typography.body1, color: Colors.text },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.s,
    backgroundColor: Colors.background,
    ...theme.typography.body1,
    color: Colors.text,
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: theme.borderRadius.l,
    borderTopRightRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    paddingBottom: 40,
  },
  modalTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    ...theme.typography.body1,
    textAlign: 'center',
  }
});
