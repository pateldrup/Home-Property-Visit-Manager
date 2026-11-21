import React, { useState } from 'react';
import { 
  View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, 
  TouchableOpacity, Text, Modal, FlatList, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { CustomInput } from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { saveProperty } from '../../services/storageService';
import { PropertyTypes, PropertyStatus } from '../../constants/propertyTypes';
import { Ionicons } from '@expo/vector-icons';

import { getReverseGeocodedLocation } from '../../services/locationService';
import { getPhoneContacts } from '../../services/contactService';

export default function AddPropertyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Contact Picker State
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'House',
    address: '',
    city: '',
    pincode: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    ownerName: '',
    ownerPhone: '',
    description: '',
    notes: '',
    tags: '',
  });

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAutoFillLocation = async () => {
    try {
      setLocationLoading(true);
      const loc = await getReverseGeocodedLocation();
      if (loc) {
        setFormData(prev => ({
          ...prev,
          address: loc.address || prev.address,
          city: loc.city || prev.city,
          pincode: loc.pincode || prev.pincode
        }));
      } else {
        Alert.alert('Notice', 'Could not determine address from current location.');
      }
    } catch (e) {
      Alert.alert('Location Error', 'Make sure location permissions are granted.');
    } finally {
      setLocationLoading(false);
    }
  };

  const openContactPicker = async () => {
    setContactsModalVisible(true);
    setContactsLoading(true);
    try {
      const data = await getPhoneContacts();
      setContacts(data);
    } catch (e) {
      Alert.alert('Contacts Error', 'Make sure contacts permissions are granted.');
      setContactsModalVisible(false);
    } finally {
      setContactsLoading(false);
    }
  };

  const selectContact = (contact) => {
    setFormData(prev => ({
      ...prev,
      ownerName: contact.name,
      ownerPhone: contact.phone
    }));
    setContactsModalVisible(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address || !formData.price) {
      Alert.alert('Error', 'Please fill in required fields (Name, Address, Price).');
      return;
    }

    setLoading(true);
    const newProperty = {
      ...formData,
      id: `prop_${Date.now()}`,
      price: parseInt(formData.price, 10) || 0,
      bedrooms: parseInt(formData.bedrooms, 10) || 0,
      bathrooms: parseInt(formData.bathrooms, 10) || 0,
      area: parseInt(formData.area, 10) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      status: PropertyStatus.ACTIVE,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const success = await saveProperty(newProperty);
    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Property added successfully!', [
        { text: 'OK', onPress: () => router.push(`/property/${newProperty.id}`) }
      ]);
    } else {
      Alert.alert('Error', 'Failed to save property.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Add Property" showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <CustomInput label="Property Name *" value={formData.name} onChangeText={(v) => updateForm('name', v)} placeholder="e.g. 3 BHK Modern House" />
        <CustomInput label="Property Type" value={formData.type} onChangeText={(v) => updateForm('type', v)} placeholder="House, Apartment, etc." />
        
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>Address *</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAutoFillLocation} disabled={locationLoading}>
            {locationLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Ionicons name="location" size={14} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Auto-fill Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <CustomInput value={formData.address} onChangeText={(v) => updateForm('address', v)} placeholder="Street, area" />
        
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput label="City" value={formData.city} onChangeText={(v) => updateForm('city', v)} placeholder="City name" />
          </View>
          <View style={styles.col}>
            <CustomInput label="Pincode" value={formData.pincode} onChangeText={(v) => updateForm('pincode', v)} placeholder="Pincode" keyboardType="numeric" />
          </View>
        </View>
        
        <CustomInput label="Price (₹) *" value={formData.price} onChangeText={(v) => updateForm('price', v)} placeholder="e.g. 4500000" keyboardType="numeric" />
        
        <View style={styles.row}>
          <View style={styles.col}>
            <CustomInput label="Bedrooms" value={formData.bedrooms} onChangeText={(v) => updateForm('bedrooms', v)} placeholder="e.g. 3" keyboardType="numeric" />
          </View>
          <View style={styles.col}>
            <CustomInput label="Bathrooms" value={formData.bathrooms} onChangeText={(v) => updateForm('bathrooms', v)} placeholder="e.g. 2" keyboardType="numeric" />
          </View>
        </View>
        
        <CustomInput label="Area (sq.ft)" value={formData.area} onChangeText={(v) => updateForm('area', v)} placeholder="e.g. 1500" keyboardType="numeric" />
        
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>Owner Details</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={openContactPicker}>
            <Ionicons name="person-add" size={14} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Select Contact</Text>
          </TouchableOpacity>
        </View>
        <CustomInput value={formData.ownerName} onChangeText={(v) => updateForm('ownerName', v)} placeholder="Owner Name" />
        <CustomInput value={formData.ownerPhone} onChangeText={(v) => updateForm('ownerPhone', v)} placeholder="Phone number" keyboardType="phone-pad" />
        
        <CustomInput label="Description" value={formData.description} onChangeText={(v) => updateForm('description', v)} placeholder="Property details..." multiline />
        <CustomInput label="Internal Notes" value={formData.notes} onChangeText={(v) => updateForm('notes', v)} placeholder="Private notes for agent..." multiline />
        <CustomInput label="Tags (comma separated)" value={formData.tags} onChangeText={(v) => updateForm('tags', v)} placeholder="e.g. Budget, Near Metro, 2BHK" />
        
        <PrimaryButton 
          title="Save Property" 
          onPress={handleSave} 
          loading={loading}
          style={styles.saveButton}
        />
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Contacts Modal */}
      <Modal visible={contactsModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TouchableOpacity onPress={() => setContactsModalVisible(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {contactsLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.contactItem} onPress={() => selectContact(item)}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No contacts found with phone numbers.</Text>}
            />
          )}
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: theme.spacing.m },
  row: { flexDirection: 'row', gap: theme.spacing.m },
  col: { flex: 1 },
  saveButton: { marginTop: theme.spacing.l },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  label: { ...theme.typography.body2, fontWeight: '600', color: Colors.text },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  actionBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  modalTitle: { ...theme.typography.h3 },
  closeBtn: { ...theme.typography.body1, color: Colors.danger, fontWeight: '600' },
  contactItem: { flexDirection: 'row', padding: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center' },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.m },
  contactAvatarText: { color: Colors.surface, fontSize: 18, fontWeight: 'bold' },
  contactName: { ...theme.typography.body1, fontWeight: '600' },
  contactPhone: { ...theme.typography.body2, color: Colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary }
});
