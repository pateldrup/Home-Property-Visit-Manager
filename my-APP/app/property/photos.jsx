import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { getProperties, updateProperty } from '../../services/storageService';
import { takePhoto, pickImageFromGallery } from '../../services/cameraService';
import { Ionicons } from '@expo/vector-icons';

export default function PhotosScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    const data = await getProperties();
    const found = data.find(p => p.id === id);
    if (found) {
      if (!found.photos) found.photos = [];
      setProperty(found);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: async () => {
        const uri = await takePhoto();
        if (uri) saveNewPhoto(uri);
      }},
      { text: 'Choose from Gallery', onPress: async () => {
        const uri = await pickImageFromGallery();
        if (uri) saveNewPhoto(uri);
      }},
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const saveNewPhoto = async (uri) => {
    setLoading(true);
    const updatedProperty = { ...property, photos: [...property.photos, uri] };
    
    await updateProperty(updatedProperty);
    setProperty(updatedProperty);
    
    setLoading(false);
  };

  if (!property) return <View style={styles.container}><Header title="Photos" /></View>;

  return (
    <View style={styles.container}>
      <Header title="Property Photos" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property.name}</Text>
          <TouchableOpacity onPress={handleAddPhoto} style={styles.addBtn}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.addBtnText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {property.photos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>No photos uploaded yet.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {property.photos.map((uri, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: theme.spacing.m },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.l },
  title: { ...theme.typography.h3, flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  addBtnText: { color: Colors.primary, fontWeight: '600', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { ...theme.typography.body1, color: Colors.textSecondary, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  imageWrapper: { width: '48%', height: 150, marginBottom: 16, borderRadius: theme.borderRadius.m, overflow: 'hidden' },
  image: { width: '100%', height: '100%' }
});
