import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { VisitCard } from '../../components/VisitCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { CalendarView } from '../../components/CalendarView';
import { getVisits, getProperties } from '../../services/storageService';

export default function VisitsScreen() {
  const router = useRouter();
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [propertiesMap, setPropertiesMap] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const filters = ['All', 'Pending', 'Completed', 'No Follow-up'];

  const loadData = async () => {
    const visitsData = await getVisits();
    const propsData = await getProperties();
    
    // Create map of property ID -> property Name
    const pMap = {};
    propsData.forEach(p => {
      pMap[p.id] = p.name;
    });
    
    setPropertiesMap(pMap);
    setVisits(visitsData);
  };

  useEffect(() => {
    let result = visits;
    if (viewMode === 'list') {
      if (activeFilter === 'Pending') {
        result = result.filter(v => v.followUpStatus && v.followUpStatus !== 'NONE' && v.followUpStatus !== 'CLOSED');
      } else if (activeFilter === 'Completed') {
        result = result.filter(v => v.followUpStatus === 'CLOSED');
      } else if (activeFilter === 'No Follow-up') {
        result = result.filter(v => !v.followUpStatus || v.followUpStatus === 'NONE');
      }
    } else {
      // Calendar mode filtering
      result = result.filter(v => v.date && v.date.startsWith(selectedDate));
    }
    setFilteredVisits(result);
  }, [visits, activeFilter, viewMode, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header title="My Visits" showBack={false} />
      
      <View style={styles.toggleContainerWrapper}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color={viewMode === 'list' ? Colors.surface : Colors.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('calendar')}
          >
            <Ionicons name="calendar" size={18} color={viewMode === 'calendar' ? Colors.surface : Colors.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'list' && (
        <View style={styles.filterContainerWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {viewMode === 'calendar' && (
        <CalendarView 
          visits={visits} 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />
      )}

      <FlatList
        data={filteredVisits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <VisitCard
            visit={item}
            propertyName={propertiesMap[item.propertyId]}
            onPress={() => router.push(`/visit/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          viewMode === 'calendar' ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="No Visits Scheduled"
              description="There are no visits scheduled for this date."
              actionTitle="+ Schedule Visit"
              onAction={() => router.push('/visit/add')}
            />
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No Visits Yet"
              description="Schedule your first property visit."
              actionTitle="+ Schedule Visit"
              onAction={() => router.push('/visit/add')}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toggleContainerWrapper: {
    backgroundColor: Colors.surface,
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: theme.borderRadius.m,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.s,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    ...theme.typography.body2,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.surface,
  },
  listContent: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  filterContainerWrapper: {
    paddingHorizontal: theme.spacing.m,
    backgroundColor: Colors.surface,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    marginTop: theme.spacing.xs,
  },
  filterContainer: {
    paddingRight: theme.spacing.m,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    ...theme.typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.surface,
  }
});
