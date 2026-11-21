import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { QuickAction } from '../../components/QuickAction';
import { getProperties, deleteProperty } from '../../services/storageService';
import { formatCurrency } from '../../utils/formatCurrency';
import { copyToClipboard } from '../../services/clipboardService';
import { shareProperty } from '../../services/shareService';
import { openInMaps } from '../../services/locationService';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const loadProperty = async () => {
      const data = await getProperties();
      const found = data.find(p => p.id === id);
      setProperty(found);
    };
    loadProperty();
  }, [id]);

  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Property Details" />
        <Text style={styles.notFound}>Property not found or loading...</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Property', 'Are you sure you want to delete this property?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteProperty(property.id);
        router.back();
      }}
    ]);
  };

  const handleCopy = async () => {
    await copyToClipboard(`${property.name}\n${property.address}\n${formatCurrency(property.price)}`);
    Alert.alert('Copied', 'Property details copied to clipboard.');
  };

  const handleShare = async () => {
    await shareProperty(property);
  };

  const handleLocation = () => {
    if (property.location && property.location.latitude) {
      openInMaps(property.location.latitude, property.location.longitude, property.name);
    } else {
      Alert.alert('No Location', 'No GPS coordinates saved for this property.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title={property.name} 
        rightIcon="ellipsis-vertical" 
        onRightPress={() => {
          Alert.alert('Options', '', [
            { text: 'Edit', onPress: () => router.push(`/property/edit?id=${property.id}`) },
            { text: 'Delete', style: 'destructive', onPress: handleDelete },
            { text: 'Cancel', style: 'cancel' }
          ]);
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {property.photos && property.photos.length > 0 ? (
            <Image source={{ uri: property.photos[0] }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="home" size={64} color={Colors.border} />
            </View>
          )}
          <View style={styles.badgeContainer}>
            <StatusBadge status={property.status} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
          <Text style={styles.title}>{property.name}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{property.address}, {property.city} - {property.pincode}</Text>
          </View>

          <View style={styles.quickActions}>
            <QuickAction icon="location" label="Location" onPress={handleLocation} />
            <QuickAction icon="camera" label="Photos" onPress={() => router.push(`/property/photos?id=${property.id}`)} />
            <QuickAction icon="call" label="Contact" onPress={() => {
              if (property.ownerPhone) {
                Linking.openURL(`tel:${property.ownerPhone}`);
              } else {
                Alert.alert('No Phone', 'No phone number provided for this owner.');
              }
            }} />
            <QuickAction icon="copy" label="Copy" onPress={handleCopy} />
            <QuickAction icon="share" label="Share" onPress={handleShare} />
          </View>

          <View style={styles.specsRow}>
            <View style={styles.spec}>
              <Ionicons name="bed-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.bedrooms} Beds</Text>
            </View>
            <View style={styles.spec}>
              <Ionicons name="water-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.bathrooms} Baths</Text>
            </View>
            <View style={styles.spec}>
              <Ionicons name="expand-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.area} sq.ft</Text>
            </View>
            <View style={styles.spec}>
              <Ionicons name="business-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.specText}>{property.type}</Text>
            </View>
          </View>

          {property.costCalculation ? (
            <View style={styles.section}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.s}}>
                <Text style={styles.sectionTitle}>Cost Estimates</Text>
                <TouchableOpacity onPress={() => router.push(`/calculator?propertyId=${property.id}`)}>
                  <Text style={{color: Colors.primary, fontWeight: 'bold', fontSize: 12}}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={{backgroundColor: Colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.s}}>
                <Text style={styles.bodyText}>Est. Monthly Cost: ₹{property.costCalculation.totalMonthlyCost?.toLocaleString()}</Text>
                <Text style={styles.bodyText}>Est. Initial Cost: ₹{property.costCalculation.totalInitialCost?.toLocaleString()}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cost Estimates</Text>
              <TouchableOpacity style={styles.calculatorBtn} onPress={() => router.push(`/calculator?propertyId=${property.id}`)}>
                <Ionicons name="calculator-outline" size={20} color={Colors.primary} />
                <Text style={styles.calculatorBtnText}>Open Cost Calculator</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Details</Text>
            <Text style={styles.bodyText}>Name: {property.ownerName}</Text>
            <Text style={styles.bodyText}>Phone: {property.ownerPhone}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.bodyText}>{property.description || 'No description provided.'}</Text>
          </View>

          {property.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Internal Notes</Text>
              <Text style={styles.bodyText}>{property.notes}</Text>
            </View>
          ) : null}

          <TouchableOpacity 
            style={[styles.favoriteBtn, property.isFavorite && styles.favoriteBtnActive]} 
            onPress={async () => {
              const newStatus = !property.isFavorite;
              setProperty({ ...property, isFavorite: newStatus });
              const { toggleFavoriteProperty } = require('../../services/storageService');
              const success = await toggleFavoriteProperty(property.id, newStatus);
              if (!success) {
                setProperty(property);
                Alert.alert('Error', 'Failed to update favorite status');
              }
            }}
          >
            <Ionicons 
              name={property.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={property.isFavorite ? "#e74c3c" : Colors.text} 
            />
            <Text style={[styles.favoriteBtnText, property.isFavorite && { color: "#e74c3c" }]}>
              {property.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Text>
          </TouchableOpacity>

          <PrimaryButton 
            title="Start Visit" 
            onPress={() => router.push(`/visit/add?propertyId=${property.id}`)} 
            style={styles.mainButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background },
  notFound: { ...theme.typography.body1, textAlign: 'center', marginTop: theme.spacing.xl },
  scrollContent: { paddingBottom: theme.spacing.xxl },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#EAEDED', position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badgeContainer: { position: 'absolute', top: theme.spacing.m, left: theme.spacing.m },
  content: { padding: theme.spacing.m, backgroundColor: Colors.surface, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l, marginTop: -20 },
  price: { ...theme.typography.h2, color: Colors.primary, marginBottom: theme.spacing.xs },
  title: { ...theme.typography.h3, marginBottom: theme.spacing.s },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l },
  locationText: { ...theme.typography.body2, marginLeft: theme.spacing.xs, flex: 1 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xl, paddingHorizontal: theme.spacing.xs },
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.xl },
  spec: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
  specText: { ...theme.typography.body1, marginLeft: theme.spacing.s, color: Colors.textSecondary },
  section: { marginBottom: theme.spacing.l },
  sectionTitle: { ...theme.typography.h4, marginBottom: theme.spacing.s },
  bodyText: { ...theme.typography.body1, color: Colors.textSecondary, lineHeight: 24, marginBottom: 4 },
  favoriteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.m, borderWidth: 1, borderColor: Colors.border, borderRadius: theme.borderRadius.m, marginTop: theme.spacing.m },
  favoriteBtnActive: { borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.05)' },
  favoriteBtnText: { ...theme.typography.h4, marginLeft: theme.spacing.s, color: Colors.text },
  mainButton: { marginTop: theme.spacing.m, marginBottom: theme.spacing.xxl },
  calculatorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '15', padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginTop: theme.spacing.xs },
  calculatorBtnText: { ...theme.typography.body1, color: Colors.primary, fontWeight: '600', marginLeft: theme.spacing.s }
});
