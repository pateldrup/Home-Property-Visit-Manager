import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';
import { theme } from '../constants/theme';
import { Colors } from '../constants/Colors';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="home" size={64} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Property Visit Manager</Text>
        <Text style={styles.subtitle}>Capture. Manage. Visit.</Text>
        <Text style={styles.description}>       
          The complete tool for real-estate professionals to manage property listings, schedule visits, and track inspections all in one place.
        </Text>
      </View>   
      
      <View style={styles.footer}>
        <PrimaryButton 
          title="Get Started"                    
          onPress={() => router.push('/login')} 
          style={styles.button} 
        />
        <SecondaryButton 
          title="Login" 
          onPress={() => router.push('/login')} 
          style={styles.button} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...theme.shadows.small,
  },
  title: {
    ...theme.typography.h2,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.h4,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  description: {
    ...theme.typography.body1,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxl,
  },
  button: {
    marginBottom: theme.spacing.m,
  }
});
