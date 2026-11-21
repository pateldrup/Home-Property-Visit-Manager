import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/ui/Header';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Header title="Visit History" />
      <View style={styles.content}>
        <Text>Visit history list goes here.</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background }, content: { padding: 16 } });
