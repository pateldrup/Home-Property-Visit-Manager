import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SETTINGS_KEY = '@visitvault_notifications_enabled';

// Set up behavior for when notification is received while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const getNotificationSettings = async () => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEY);
    return value !== 'false'; // default is true
  } catch (e) {
    return true;
  }
};

export const setNotificationSettings = async (enabled) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, enabled ? 'true' : 'false');
    if (!enabled) {
      // Cancel all if user disables notifications globally
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return false;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Permission check failed', error);
    return false;
  }
};

export const scheduleVisitReminder = async (visitDate, propertyName, preference, visitId) => {
  if (Platform.OS === 'web') return null;
  if (preference === 'NONE' || !preference) return null;

  try {
    const isEnabled = await getNotificationSettings();
    if (!isEnabled) return null;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const date = new Date(visitDate);
    let offsetMinutes = 0;
    
    switch (preference) {
      case '15m': offsetMinutes = 15; break;
      case '30m': offsetMinutes = 30; break;
      case '1h': offsetMinutes = 60; break;
      case '1d': offsetMinutes = 24 * 60; break;
    }

    const triggerDate = new Date(date.getTime() - offsetMinutes * 60000);

    // If trigger date is in the past, we cannot schedule it
    if (triggerDate <= new Date()) {
      return null;
    }

    let timeText = '';
    if (preference === '15m') timeText = '15 minutes';
    if (preference === '30m') timeText = '30 minutes';
    if (preference === '1h') timeText = '1 hour';
    if (preference === '1d') timeText = '1 day';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Property Visit Reminder',
        body: `Your visit to ${propertyName || 'the property'} is scheduled in ${timeText}.`,
        sound: true,
        data: { screen: 'visit', visitId }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null; // Don't crash if scheduling fails
  }
};

export const cancelVisitReminder = async (notificationId) => {
  if (!notificationId || Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};
