import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { saveVisit, getProperties } from '../../services/storageService';
import { VisitStatus } from '../../constants/propertyTypes';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTime } from '../../utils/formatDate';
import { scheduleVisitReminder } from '../../services/notificationService';

export default function ScheduleVisitScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyId: propertyId || '',
    agent: '',
    purpose: '',
    notes: '',
  });

  const [visitDate, setVisitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderPreference, setReminderPreference] = useState('NONE');
  const [showReminderModal, setShowReminderModal] = useState(false);

  const reminders = [
    { label: 'No Reminder', value: 'NONE' },
    { label: '15 minutes before', value: '15m' },
    { label: '30 minutes before', value: '30m' },
    { label: '1 hour before', value: '1h' },
    { label: '1 day before', value: '1d' },
  ];

  useEffect(() => {
    const fetchProps = async () => {
      const data = await getProperties();
      setProperties(data);
      if (!formData.propertyId && data.length > 0) {
        setFormData(prev => ({ ...prev, propertyId: data[0].id }));
      }
    };
    fetchProps();
  }, []);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!formData.propertyId || !formData.agent) {
      Alert.alert('Error', 'Please fill in property and agent name.');
      return;
    }

    setLoading(true);
    
    const visitId = `visit_${Date.now()}`;
    const propName = properties.find(p => p.id === formData.propertyId)?.name;
    const notificationId = await scheduleVisitReminder(visitDate.toISOString(), propName, reminderPreference, visitId);

    const newVisit = {
      ...formData,
      id: visitId,
      date: visitDate.toISOString(),
      status: VisitStatus.SCHEDULED,
      inspection: null,
      reminderPreference,
      notificationId: notificationId || undefined,
    };

    const success = await saveVisit(newVisit);
    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Visit scheduled successfully!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/visits') }
      ]);
    } else {
      Alert.alert('Error', 'Failed to schedule visit.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Schedule Visit" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.label}>Select Property</Text>
        <View style={styles.pickerContainer}>
          {/* Simple mock picker using touchables for demo */}           
          {properties.map(p => (
            <TouchableOpacity 
              key={p.id} 
              style={[styles.pickerItem, formData.propertyId === p.id && styles.pickerItemActive]}
              onPress={() => updateForm('propertyId', p.id)}
            >
              <Text style={[styles.pickerText, formData.propertyId === p.id && styles.pickerTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Scheduled Date</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dropdownText}>{formatDate(visitDate.toISOString())}</Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={visitDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setVisitDate(selectedDate);
            }}
          />
        )}

        <Text style={[styles.label, { marginTop: theme.spacing.m }]}>Scheduled Time</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dropdownText}>{formatTime(visitDate.toISOString())}</Text>
          <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={visitDate}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) setVisitDate(selectedDate);
            }}
          />
        )}

        <Text style={[styles.label, { marginTop: theme.spacing.m }]}>Reminder Options</Text>
        <TouchableOpacity style={[styles.dropdown, { marginBottom: theme.spacing.m }]} onPress={() => setShowReminderModal(true)}>
          <Text style={styles.dropdownText}>{reminders.find(r => r.value === reminderPreference)?.label}</Text>
          <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <CustomInput label="Agent / Visitor Name *" value={formData.agent} onChangeText={(v) => updateForm('agent', v)} placeholder="e.g. Rahul Patel" />
        <CustomInput label="Purpose" value={formData.purpose} onChangeText={(v) => updateForm('purpose', v)} placeholder="e.g. Initial Inspection" />
        <CustomInput label="Notes" value={formData.notes} onChangeText={(v) => updateForm('notes', v)} placeholder="Special instructions..." multiline />
        
        <PrimaryButton 
          title="Schedule Visit" 
          onPress={handleSave} 
          loading={loading}
          style={styles.saveButton}
        />
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showReminderModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowReminderModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Reminder</Text>
            {reminders.map((r) => (
              <TouchableOpacity 
                key={r.value} 
                style={styles.modalItem}
                onPress={() => {
                  setReminderPreference(r.value);
                  setShowReminderModal(false);
                }}
              >
                <Text style={[styles.modalItemText, reminderPreference === r.value && { color: Colors.primary, fontWeight: 'bold' }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: theme.spacing.m },
  label: { ...theme.typography.body2, fontWeight: '600', color: Colors.text, marginBottom: theme.spacing.xs },
  pickerContainer: { marginBottom: theme.spacing.m },
  pickerItem: { padding: theme.spacing.m, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.xs },
  pickerItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  pickerText: { ...theme.typography.body1 },
  pickerTextActive: { color: Colors.primary, fontWeight: 'bold' },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.s,
    backgroundColor: Colors.surface,
  },
  dropdownText: { ...theme.typography.body1, color: Colors.text },
  saveButton: { marginTop: theme.spacing.l },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l, padding: theme.spacing.m, paddingBottom: 40 },
  modalTitle: { ...theme.typography.h3, marginBottom: theme.spacing.m, textAlign: 'center' },
  modalItem: { paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalItemText: { ...theme.typography.body1, textAlign: 'center' }
});
