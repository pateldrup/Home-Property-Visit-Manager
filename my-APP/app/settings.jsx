import React from 'react';
import { View, Text, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { theme } from '../constants/theme';
import { Header } from '../components/ui/Header';
import { clearData } from '../services/storageService';
import { logoutUser } from '../services/authService';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { getNotificationSettings, setNotificationSettings } from '../services/notificationService';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(true);

  React.useEffect(() => {
    const loadSettings = async () => {
      const isEnabled = await getNotificationSettings();
      setNotifications(isEnabled);
    };
    loadSettings();
  }, []);

  const handleToggleNotifications = async (value) => {
    setNotifications(value);
    await setNotificationSettings(value);
  };

  const handleClearData = () => {
    Alert.alert('Clear Data', 'Are you sure you want to delete all local properties and visits?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await clearData();
        Alert.alert('Success', 'Data cleared successfully.');
      }}
    ]);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      
      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: theme.spacing.m }}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDesc}>Receive local reminders for scheduled visits.</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={handleToggleNotifications} 
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <PrimaryButton 
            title="Clear Local Data" 
            onPress={handleClearData} 
            style={[styles.button, { backgroundColor: Colors.warning }]} 
          />
          <PrimaryButton 
            title="Logout" 
            onPress={handleLogout} 
            style={[styles.button, { backgroundColor: Colors.danger, marginTop: theme.spacing.m }]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: theme.spacing.m,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    ...theme.shadows.small,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.m,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
  },
  settingLabel: {
    ...theme.typography.body1,
  },
  settingDesc: {
    ...theme.typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  button: {
    width: '100%',
  }
});
