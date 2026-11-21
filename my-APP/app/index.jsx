import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getSession } from '../services/authService';
import { Colors } from '../constants/Colors';

export default function IndexScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        // Give router a moment to mount before redirecting
        setTimeout(() => {
          if (session) {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }, 500);
      } catch (error) {
        console.error('Auth check error', error);
        router.replace('/onboarding');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
});
