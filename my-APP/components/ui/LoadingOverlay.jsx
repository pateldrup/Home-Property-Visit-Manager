import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../../constants/theme';
import { Colors } from '../../constants/Colors';

export const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  box: {
    backgroundColor: Colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  text: {
    ...theme.typography.body1,
    marginTop: theme.spacing.m,
    fontWeight: '600',
  }
});
