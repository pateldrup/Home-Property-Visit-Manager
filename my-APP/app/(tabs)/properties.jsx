import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Text, TouchableOpacity, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { SearchBar } from '../../components/ui/SearchBar';
import { PropertyCard } from '../../components/PropertyCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { getProperties, toggleFavoriteProperty } from '../../services/storageService';

export default function PropertiesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  
  const initialFilters = {
    type: 'All', sort: 'newest', minPrice: '', maxPrice: '', beds: '', baths: '', tags: '', isFavorite: false
  };
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const loadProperties = async (currentFilters, query) => {
    const data = await getProperties({ ...currentFilters, search: query });
    setProperties(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProperties(filters, searchQuery);
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProperties(filters, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const handleFavoriteToggle = async (property) => {
    const newStatus = !property.isFavorite;
    const updatedProperties = properties.map(p => p.id === property.id ? { ...p, isFavorite: newStatus } : p);
    setProperties(updatedProperties);
    const success = await toggleFavoriteProperty(property.id, newStatus);
    if (!success) {
      setProperties(properties);
      alert('Failed to update favorite status');
    }
  };

  const handleSelectCompare = (property) => {
    if (selectedForCompare.includes(property.id)) {
      setSelectedForCompare(prev => prev.filter(id => id !== property.id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert("You can select a maximum of 4 properties to compare.");
        return;
      }
      setSelectedForCompare(prev => [...prev, property.id]);
    }
  };

  const activeFilterCount = Object.keys(filters).reduce((acc, key) => {
    if (key === 'type' && filters[key] !== 'All') return acc + 1;
    if (key === 'sort' && filters[key] !== 'newest') return acc + 1;
    if (key !== 'type' && key !== 'sort' && filters[key]) return acc + 1;
    return acc;
  }, 0);

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setTempFilters(initialFilters);
    setFilters(initialFilters);
    setFilterModalVisible(false);
  };

  const updateTempFilter = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <Header title="My Properties" showBack={false} />
      
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          onFilterPress={() => {
            setTempFilters(filters);
            setFilterModalVisible(true);
          }} 
        />
        {activeFilterCount > 0 && (
          <View style={styles.activeFilterBadge}>
            <Text style={styles.activeFilterBadgeText}>Filters ({activeFilterCount})</Text>
          </View>
        )}
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => router.push(`/property/${item.id}`)}
            onFavoritePress={handleFavoriteToggle}
            isSelectedForCompare={selectedForCompare.includes(item.id)}
            onSelectCompare={handleSelectCompare}
          />
        )}
        ListEmptyComponent={
          filters.isFavorite ? (
            <EmptyState title="No favorite properties" description="Tap the heart icon on a property to save it here." actionTitle="Clear Filters" onAction={clearFilters} />
          ) : (
            <EmptyState title="No Properties Found" description="Try adjusting your filters or add a new property." actionTitle="+ Add Property" onAction={() => router.push('/(tabs)/add')} />
          )
        }
      />
      
      {selectedForCompare.length > 0 && (
        <View style={styles.compareFooter}>
          <Text style={styles.compareFooterText}>Compare ({selectedForCompare.length})</Text>
          <TouchableOpacity 
            style={[styles.compareFooterBtn, selectedForCompare.length < 2 && styles.compareFooterBtnDisabled]}
            disabled={selectedForCompare.length < 2}
            onPress={() => router.push(`/compare?ids=${selectedForCompare.join(',')}`)}
          >
            <Text style={styles.compareFooterBtnText}>Compare</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text style={styles.closeBtn}>Close</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {['newest', 'oldest', 'priceAsc', 'priceDesc', 'ratingDesc'].map(sortOp => (
                <TouchableOpacity key={sortOp} style={[styles.filterPill, tempFilters.sort === sortOp && styles.filterPillActive]} onPress={() => updateTempFilter('sort', sortOp)}>
                  <Text style={[styles.filterText, tempFilters.sort === sortOp && styles.filterTextActive]}>
                    {sortOp === 'newest' ? 'Newest' : sortOp === 'oldest' ? 'Oldest' : sortOp === 'priceAsc' ? 'Price: Low-High' : sortOp === 'priceDesc' ? 'Price: High-Low' : 'Highest Rated'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Property Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {['All', 'House', 'Apartment', 'Villa', 'Commercial'].map(t => (
                <TouchableOpacity key={t} style={[styles.filterPill, tempFilters.type === t && styles.filterPillActive]} onPress={() => updateTempFilter('type', t)}>
                  <Text style={[styles.filterText, tempFilters.type === t && styles.filterTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.row}>
              <View style={styles.col}><CustomInput placeholder="Min Price" value={tempFilters.minPrice} onChangeText={(v) => updateTempFilter('minPrice', v)} keyboardType="numeric" /></View>
              <View style={styles.col}><CustomInput placeholder="Max Price" value={tempFilters.maxPrice} onChangeText={(v) => updateTempFilter('maxPrice', v)} keyboardType="numeric" /></View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}><CustomInput label="Bedrooms" placeholder="Min Beds" value={tempFilters.beds} onChangeText={(v) => updateTempFilter('beds', v)} keyboardType="numeric" /></View>
              <View style={styles.col}><CustomInput label="Bathrooms" placeholder="Min Baths" value={tempFilters.baths} onChangeText={(v) => updateTempFilter('baths', v)} keyboardType="numeric" /></View>
            </View>

            <CustomInput label="Tags (Comma Separated)" placeholder="e.g. Budget, Near Metro" value={tempFilters.tags} onChangeText={(v) => updateTempFilter('tags', v)} />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Show Favorites Only</Text>
              <Switch value={tempFilters.isFavorite} onValueChange={(v) => updateTempFilter('isFavorite', v)} />
            </View>

          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}><Text style={styles.clearBtnText}>Clear Filters</Text></TouchableOpacity>
            <PrimaryButton title="Apply Filters" onPress={applyFilters} style={{flex: 1}} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { paddingHorizontal: theme.spacing.m, backgroundColor: Colors.surface, paddingBottom: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border },
  activeFilterBadge: { position: 'absolute', right: theme.spacing.m + 10, top: 4, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activeFilterBadgeText: { color: Colors.surface, fontSize: 10, fontWeight: 'bold' },
  listContent: { padding: theme.spacing.m, flexGrow: 1, paddingBottom: 100 },
  compareFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, padding: theme.spacing.m, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, ...theme.shadows.medium },
  compareFooterText: { ...theme.typography.h4, color: Colors.text },
  compareFooterBtn: { backgroundColor: Colors.primary, paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.s, borderRadius: theme.borderRadius.m },
  compareFooterBtnDisabled: { backgroundColor: Colors.border },
  compareFooterBtnText: { ...theme.typography.body1, color: Colors.surface, fontWeight: 'bold' },
  
  modalContainer: { flex: 1, backgroundColor: Colors.background, paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  modalTitle: { ...theme.typography.h3 },
  closeBtn: { ...theme.typography.body1, color: Colors.danger, fontWeight: '600' },
  modalScroll: { padding: theme.spacing.m, paddingBottom: 100 },
  filterSectionTitle: { ...theme.typography.h4, marginTop: theme.spacing.m, marginBottom: theme.spacing.s },
  pillScroll: { marginBottom: theme.spacing.s },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginRight: 8 },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { ...theme.typography.body2, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.surface },
  row: { flexDirection: 'row', gap: theme.spacing.m },
  col: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.m, padding: theme.spacing.m, backgroundColor: Colors.surface, borderRadius: theme.borderRadius.s },
  label: { ...theme.typography.body1, fontWeight: '500' },
  modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: theme.spacing.m, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', gap: theme.spacing.m },
  clearBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: theme.borderRadius.m },
  clearBtnText: { ...theme.typography.body1, color: Colors.textSecondary, fontWeight: 'bold' }
});
