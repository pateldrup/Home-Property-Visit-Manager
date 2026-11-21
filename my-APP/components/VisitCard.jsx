import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Colors } from '../constants/Colors';
import { StatusBadge } from './ui/StatusBadge';
import { formatDate, formatTime } from '../utils/formatDate';
import { getFollowUpStatusLabel } from '../constants/propertyTypes';

export const VisitCard = ({ visit, propertyName, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.dateText}>{formatDate(visit.date)} • {formatTime(visit.date)}</Text>
        </View>
        <StatusBadge status={visit.status} />
      </View>
      
      <Text style={styles.propertyName} numberOfLines={1}>{propertyName || 'Unknown Property'}</Text>
      
      <View style={styles.agentRow}>
        <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.agentText}>{visit.agent}</Text>
      </View>
      
      {visit.purpose && (
        <Text style={styles.purposeText} numberOfLines={1}>Purpose: {visit.purpose}</Text>
      )}

      {visit.followUpStatus && visit.followUpStatus !== 'NONE' && (
        <View style={styles.followUpRow}>
          <Ionicons name="flag-outline" size={14} color={Colors.primary} />
          <Text style={styles.followUpText}>Follow-up: {getFollowUpStatusLabel(visit.followUpStatus)}</Text>
          {(visit.followUpDate && new Date(visit.followUpDate) < new Date() && visit.followUpStatus !== 'CLOSED') && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>OVERDUE</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...theme.typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  propertyName: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.xs,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  agentText: {
    ...theme.typography.body2,
    marginLeft: theme.spacing.xs,
  },
  purposeText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  followUpText: {
    ...theme.typography.caption,
    marginLeft: 4,
    color: Colors.text,
    flex: 1,
  },
  overdueBadge: {
    backgroundColor: '#ffeaa7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d35400',
  }
});
