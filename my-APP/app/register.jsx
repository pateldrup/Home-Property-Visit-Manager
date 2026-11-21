import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/ui/CustomInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { registerUser } from '../services/authService';
import { theme } from '../constants/theme';
import { Colors } from '../constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    
    if (name.trim().length === 0) {
      setError('Please enter your full name.');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, name);
      router.replace('/(tabs)');
    } catch (e) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={48} color={Colors.surface} />
          </View>
          <Text style={styles.brandTitle}>Agent Connect</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Join us and manage your visits.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomInput
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />

          <CustomInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="mail-outline"
          />

          <CustomInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <PrimaryButton
            title="Sign Up"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold} onPress={() => router.replace('/login')}>Login</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.m,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandTitle: {
    ...theme.typography.h2,
    color: Colors.surface,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    ...theme.shadows.medium,
  },
  welcomeTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    ...theme.typography.body2,
    marginBottom: theme.spacing.l,
  },
  errorText: {
    color: Colors.danger,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.m,
  },
  loginText: {
    ...theme.typography.body2,
    textAlign: 'center',
  },
  loginTextBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
