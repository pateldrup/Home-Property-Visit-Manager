import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Colors } from '../constants/Colors';

export const StatsCard = ({ label, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  value: {
    ...theme.typography.h2,
    color: Colors.primary,
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    textAlign: 'center',
  }
});
