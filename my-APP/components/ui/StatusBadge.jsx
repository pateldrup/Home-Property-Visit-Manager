import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { getPropertyStatusColor } from '../../utils/propertyHelpers';
import { Colors } from '../../constants/Colors';

export const StatusBadge = ({ status, style }) => {
  const bgColor = getPropertyStatusColor(status, Colors);
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor + '20' }, style]}>
      <Text style={[styles.text, { color: bgColor }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  }
});
