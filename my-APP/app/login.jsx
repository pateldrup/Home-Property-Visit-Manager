import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/ui/CustomInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { loginUser } from '../services/authService';
import { theme } from '../constants/theme';
import { Colors } from '../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
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
      await loginUser(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      setError('Login failed. Please try again.');
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
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Manage your property visits with ease.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
            
          <Text style={styles.createAccount}>
            Don't have an account? <Text style={styles.createAccountBold} onPress={() => router.push('/register')}>Create Account</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // Dark overlay / Real-estate bg equivalent
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
  forgotPassword: {
    ...theme.typography.body2,
    color: Colors.primary,
    textAlign: 'right',
    marginBottom: theme.spacing.l,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: theme.spacing.l,
  },
  createAccount: {
    ...theme.typography.body2,
    textAlign: 'center',
  },
  createAccountBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
