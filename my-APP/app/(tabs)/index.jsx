import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { PropertyCard } from '../../components/PropertyCard';
import { StatsCard } from '../../components/StatsCard';
import { VisitCard } from '../../components/VisitCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { getProperties, getProfilePhoto, getVisits } from '../../services/storageService';
import { getSession } from '../../services/authService';
import { generateAnalytics } from '../../services/analyticsService';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('VisitVault');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [propertiesMap, setPropertiesMap] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);

  const loadData = async () => {
    const data = await getProperties();
    setProperties(data);

    const visits = await getVisits();
    const pending = visits.filter(v => v.followUpStatus && v.followUpStatus !== 'NONE' && v.followUpStatus !== 'CLOSED');
    setPendingFollowUps(pending);

    const pMap = {};
    data.forEach(p => { pMap[p.id] = p.name || p.title; });
    setPropertiesMap(pMap);

    const analytics = generateAnalytics(data, visits);
    setAnalyticsData(analytics);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      
      const loadUser = async () => {
        const session = await getSession();
        if (session?.user?.name) {
          // Keep it as VisitVault or handle differently if needed
        }
        
        const photo = await getProfilePhoto();
        setProfilePhoto(photo);
      };
      loadUser();
    }, [])
  );

  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + theme.spacing.s }]}>
        <View>
          <Text style={styles.greeting}> </Text>
          <Text style={styles.agentName}>{userName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationIcon} 
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
            ) : (
              <Ionicons name="person" size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Expand Your Portfolio</Text>
          <Text style={styles.heroDescription}>
            Quickly add new listings to manage visits and offers.
          </Text>
          <PrimaryButton 
            title="+ Add Property" 
            onPress={() => router.push('/(tabs)/add')}
            style={styles.heroButton}
          />
        </View>

        {/* Quick Tools */}
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/calculator')}>
            <Ionicons name="calculator" size={24} color={Colors.primary} />
            <Text style={styles.toolLabel}>Cost Calculator</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        {analyticsData && analyticsData.stats.totalProperties === 0 && analyticsData.stats.scheduledVisits === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="stats-chart-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyStateText}>Not enough data yet</Text>
            <Text style={styles.emptyStateSubtext}>Add properties and schedule visits to see analytics.</Text>
          </View>
        ) : (
          analyticsData && (
            <>
              {/* Comprehensive Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.stats.totalProperties}</Text>
                  <Text style={styles.metricLabel}>Total Properties</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.stats.visitedProperties}</Text>
                  <Text style={styles.metricLabel}>Visited</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.stats.favoriteProperties}</Text>
                  <Text style={styles.metricLabel}>Favorites</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.stats.scheduledVisits}</Text>
                  <Text style={styles.metricLabel}>Scheduled</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsData.stats.completedVisits}</Text>
                  <Text style={styles.metricLabel}>Completed</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: analyticsData.stats.pendingFollowUps > 0 ? Colors.danger : Colors.text }]}>{analyticsData.stats.pendingFollowUps}</Text>
                  <Text style={styles.metricLabel}>Follow-ups</Text>
                </View>
              </View>

              {/* Visual Analytics */}
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionTitle}>Analytics</Text>
                
                {/* Properties by Status Bar */}
                <Text style={styles.analyticsLabel}>Properties by Status</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarSegment, { flex: analyticsData.stats.propertiesAvailable || 1, backgroundColor: Colors.border }]} />
                  <View style={[styles.progressBarSegment, { flex: analyticsData.stats.propertiesPending || 0, backgroundColor: Colors.warning || '#f39c12' }]} />
                  <View style={[styles.progressBarSegment, { flex: analyticsData.stats.propertiesConfirmed || 0, backgroundColor: Colors.primary }]} />
                </View>
                <View style={styles.progressLegend}>
                  <Text style={styles.legendText}>Available ({analyticsData.stats.propertiesAvailable})</Text>
                  <Text style={styles.legendText}>Pending ({analyticsData.stats.propertiesPending})</Text>
                  <Text style={styles.legendText}>Confirmed ({analyticsData.stats.propertiesConfirmed})</Text>
                </View>

                {/* Averages */}
                <View style={styles.averagesRow}>
                  <View style={styles.averageCard}>
                    <Text style={styles.averageLabel}>Avg Property Rating</Text>
                    <Text style={styles.averageValue}>⭐ {analyticsData.stats.averagePropertyRating}</Text>
                  </View>
                  <View style={styles.averageCard}>
                    <Text style={styles.averageLabel}>Avg Visit Score</Text>
                    <Text style={styles.averageValue}>✓ {analyticsData.stats.averageVisitScore}%</Text>
                  </View>
                </View>
              </View>

              {/* Recent Activity Timeline */}
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {analyticsData.recentActivity.length === 0 ? (
                  <Text style={{color: Colors.textSecondary, marginTop: 10}}>No recent activity.</Text>
                ) : (
                  analyticsData.recentActivity.map((group, gIdx) => (
                    <View key={gIdx} style={styles.timelineGroup}>
                      <Text style={styles.timelineDate}>{group.label}</Text>
                      {group.data.map(event => (
                        <View key={event.id} style={styles.timelineEvent}>
                          <View style={[styles.timelineIconContainer, { backgroundColor: event.color + '20' }]}>
                            <Ionicons name={event.icon} size={16} color={event.color} />
                          </View>
                          <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>{event.title}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </View>
            </>
          )
        )}

        {pendingFollowUps.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Follow-ups</Text>
              <Text 
                style={styles.viewAll} 
                onPress={() => router.push('/(tabs)/visits')}
              >
                View All
              </Text>
            </View>
            
            {pendingFollowUps.slice(0, 3).map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                propertyName={propertiesMap[visit.propertyId]}
                onPress={() => router.push(`/visit/${visit.id}`)}
              />
            ))}
          </>
        )}

        {/* Recent Visits / Properties */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Properties</Text>
          <Text 
            style={styles.viewAll} 
            onPress={() => router.push('/(tabs)/properties')}
          >
            View All
          </Text>
        </View>

        {properties.slice(0, 3).map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPress={() => router.push(`/property/${property.id}`)}
            onMorePress={() => {}}
            onFavoritePress={async (prop) => {
              const newStatus = !prop.isFavorite;
              const updatedProperties = properties.map(p => 
                p.id === prop.id ? { ...p, isFavorite: newStatus } : p
              );
              setProperties(updatedProperties);
              
              const { toggleFavoriteProperty } = require('../../services/storageService');
              const success = await toggleFavoriteProperty(prop.id, newStatus);
              if (!success) setProperties(properties);
            }}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
    backgroundColor: Colors.surface,
  },
  greeting: {
    ...theme.typography.body2,
    color: Colors.textSecondary,
  },
  agentName: {
    ...theme.typography.h3,
    color: Colors.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: theme.spacing.m,
    padding: theme.spacing.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  scrollContent: {
    padding: theme.spacing.m,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.medium,
  },
  heroTitle: {
    ...theme.typography.h3,
    color: Colors.surface,
    marginBottom: theme.spacing.xs,
  },
  heroDescription: {
    ...theme.typography.body1,
    color: Colors.border,
    marginBottom: theme.spacing.l,
  },
  heroButton: {
    backgroundColor: Colors.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
  },
  viewAll: {
    ...theme.typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, backgroundColor: Colors.surface, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.l },
  emptyStateText: { ...theme.typography.h4, color: Colors.textSecondary, marginTop: theme.spacing.s },
  emptyStateSubtext: { ...theme.typography.body2, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.l },
  metricCard: { width: '31%', backgroundColor: Colors.surface, borderRadius: theme.borderRadius.s, padding: theme.spacing.s, alignItems: 'center', marginBottom: theme.spacing.s, ...theme.shadows.small },
  metricValue: { ...theme.typography.h3, color: Colors.primary },
  metricLabel: { ...theme.typography.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  analyticsSection: { backgroundColor: Colors.surface, borderRadius: theme.borderRadius.m, padding: theme.spacing.m, marginBottom: theme.spacing.l, ...theme.shadows.small },
  analyticsLabel: { ...theme.typography.body2, color: Colors.textSecondary, marginBottom: theme.spacing.xs, marginTop: theme.spacing.m },
  progressBarContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: Colors.border, marginBottom: 8 },
  progressBarSegment: { height: '100%' },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendText: { ...theme.typography.caption, color: Colors.textSecondary, fontSize: 10 },
  averagesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.m },
  averageCard: { flex: 1, backgroundColor: Colors.background, padding: theme.spacing.s, borderRadius: theme.borderRadius.s, marginRight: theme.spacing.s, alignItems: 'center' },
  averageLabel: { ...theme.typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  averageValue: { ...theme.typography.h4, color: Colors.text },
  timelineGroup: { marginTop: theme.spacing.m },
  timelineDate: { ...theme.typography.body2, color: Colors.textSecondary, marginBottom: theme.spacing.s, fontWeight: 'bold' },
  timelineEvent: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
  timelineIconContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.s },
  timelineContent: { flex: 1 },
  timelineTitle: { ...theme.typography.body1, color: Colors.text },
  toolsRow: { flexDirection: 'row', marginBottom: theme.spacing.l, gap: theme.spacing.m },
  toolCard: { flex: 1, backgroundColor: Colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, alignItems: 'center', justifyContent: 'center', ...theme.shadows.small },
  toolLabel: { ...theme.typography.body2, color: Colors.text, marginTop: 8, fontWeight: '600' }
});
