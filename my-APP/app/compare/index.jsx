import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { EmptyState } from '../../components/ui/EmptyState';
import { getProperties, getVisits } from '../../services/storageService';
import { formatCurrency } from '../../utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';

export default function CompareScreen() {
  const { ids } = useLocalSearchParams();
  const router = useRouter();
  
  const [properties, setProperties] = useState([]);
  const [visitsData, setVisitsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!ids) {
          setLoading(false);
          return;
        }
        
        const idArray = ids.split(',');
        const allProps = await getProperties();
        const allVisits = await getVisits();
        
        setVisitsData(allVisits);
        
        const selectedProps = allProps.filter(p => idArray.includes(p.id)).slice(0, 4);
        setProperties(selectedProps);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [ids]);

  const removeProperty = (id) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setProperties([]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Compare Properties" />
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>
      </View>
    );
  }

  if (properties.length < 2) {
    return (
      <View style={styles.container}>
        <Header title="Compare Properties" />
        <View style={styles.emptyContainer}>
          <EmptyState 
            title="Compare Properties"
            description="Select at least 2 properties to compare."
            actionTitle="Go to Properties"
            onAction={() => router.push('/(tabs)/properties')}
          />
        </View>
      </View>
    );
  }

  const bestPrice = Math.min(...properties.map(p => p.price || 0));
  const bestBeds = Math.max(...properties.map(p => p.bedrooms || 0));
  const bestBaths = Math.max(...properties.map(p => p.bathrooms || 0));
  const bestArea = Math.max(...properties.map(p => p.area || 0));
  const bestRating = Math.max(...properties.map(p => p.rating || 0));
  
  const getVisitsCount = (id) => visitsData.filter(v => v.propertyId === id).length;
  const bestVisits = Math.max(...properties.map(p => getVisitsCount(p.id)));

  return (
    <View style={styles.container}>
      <Header 
        title="Compare" 
        rightElement={
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollWrapper}>
        <View style={styles.tableWrapper}>
          
          <View style={styles.labelColumn}>
            <View style={[styles.cell, styles.headerCell]}><Text style={styles.labelText}>Property</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Price</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Location</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Bedrooms</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Bathrooms</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Area</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Type</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Status</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Rating</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Visits</Text></View>
            <View style={styles.cell}><Text style={styles.labelText}>Favorite</Text></View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {properties.map(p => (
              <View key={p.id} style={styles.dataColumn}>
                
                <View style={[styles.cell, styles.headerCell]}>
                  <TouchableOpacity onPress={() => removeProperty(p.id)} style={styles.removeBtn}>
                    <Ionicons name="close-circle" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                  <Text style={styles.propertyName} numberOfLines={2}>{p.name}</Text>
                </View>
                
                <View style={styles.cell}>
                  <Text style={[styles.dataText, p.price === bestPrice && p.price > 0 && styles.bestData]}>
                    {formatCurrency(p.price)}
                  </Text>
                </View>
                
                <View style={styles.cell}>
                  <Text style={styles.dataText} numberOfLines={2}>{p.address}, {p.city}</Text>
                </View>
                
                <View style={styles.cell}>
                  <Text style={[styles.dataText, p.bedrooms === bestBeds && p.bedrooms > 0 && styles.bestData]}>
                    {p.bedrooms || 0}
                  </Text>
                </View>

                <View style={styles.cell}>
                  <Text style={[styles.dataText, p.bathrooms === bestBaths && p.bathrooms > 0 && styles.bestData]}>
                    {p.bathrooms || 0}
                  </Text>
                </View>

                <View style={styles.cell}>
                  <Text style={[styles.dataText, p.area === bestArea && p.area > 0 && styles.bestData]}>
                    {p.area ? `${p.area} sqft` : 'N/A'}
                  </Text>
                </View>

                <View style={styles.cell}>
                  <Text style={styles.dataText}>{p.type}</Text>
                </View>

                <View style={styles.cell}>
                  <Text style={styles.dataText}>{p.status}</Text>
                </View>
                
                <View style={styles.cell}>
                  <Text style={[styles.dataText, (p.rating || 0) === bestRating && (p.rating || 0) > 0 && styles.bestData]}>
                    {p.rating ? `${p.rating}/5` : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.cell}>
                  <Text style={[styles.dataText, getVisitsCount(p.id) === bestVisits && getVisitsCount(p.id) > 0 && styles.bestData]}>
                    {getVisitsCount(p.id)}
                  </Text>
                </View>

                <View style={styles.cell}>
                  <Ionicons name={p.isFavorite ? "heart" : "heart-outline"} size={20} color={p.isFavorite ? "#e74c3c" : Colors.textSecondary} />
                </View>

              </View>
            ))}
          </ScrollView>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', padding: theme.spacing.m },
  clearText: { ...theme.typography.body2, color: Colors.primary, fontWeight: 'bold' },
  scrollWrapper: { flex: 1 },
  tableWrapper: { flexDirection: 'row', backgroundColor: Colors.surface, margin: theme.spacing.s, borderRadius: theme.borderRadius.m, ...theme.shadows.small, overflow: 'hidden' },
  labelColumn: { width: 100, borderRightWidth: 1, borderRightColor: Colors.border, backgroundColor: Colors.background },
  dataColumn: { width: 130, borderRightWidth: 1, borderRightColor: Colors.border },
  cell: { height: 60, padding: theme.spacing.s, borderBottomWidth: 1, borderBottomColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  headerCell: { height: 80, backgroundColor: Colors.background, position: 'relative' },
  labelText: { ...theme.typography.body2, fontWeight: 'bold', color: Colors.textSecondary },
  dataText: { ...theme.typography.body2, textAlign: 'center', color: Colors.text },
  bestData: { color: '#27ae60', fontWeight: 'bold' },
  propertyName: { ...theme.typography.body2, fontWeight: 'bold', textAlign: 'center', marginTop: 16 },
  removeBtn: { position: 'absolute', top: 4, right: 4, zIndex: 10 }
});
