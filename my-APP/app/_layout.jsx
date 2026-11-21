import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen === 'visit' && data?.visitId) {
        router.push(`/visit/${data.visitId}`);
      } else if (data?.screen === 'visit') {
        router.push('/(tabs)/visits');
      }
    });
    return () => subscription.remove();
  }, []);
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="property/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="property/photos" options={{ presentation: 'modal' }} />
        <Stack.Screen name="visit/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="visit/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="visit/inspection" options={{ presentation: 'card' }} />
        <Stack.Screen name="visit/history" options={{ presentation: 'modal' }} />
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="location" options={{ presentation: 'modal' }} />
        <Stack.Screen name="contacts" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
