import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { theme } from '../../constants/theme';
import { Header } from '../../components/ui/Header';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { logoutUser, getSession } from '../../services/authService';
import { getProfilePhoto, saveProfilePhoto } from '../../services/storageService';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePhoto(uri);
      await saveProfilePhoto(uri);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      if (session && session.user) {
        setUser(session.user);
      }
      const photoUri = await getProfilePhoto();
      if (photoUri) {
        setProfilePhoto(photoUri);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const handleSaveProfile = () => {
    setUser(prev => ({ ...prev, name: editName, email: editEmail }));
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" showBack={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatar} onPress={handlePickImage} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color={Colors.surface} />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color={Colors.surface} />
            </View>
          </TouchableOpacity>
            
          {isEditing ? (
            <View style={styles.editFormContainer}>
              <CustomInput 
                label="Full Name" 
                value={editName} 
                onChangeText={setEditName} 
                icon="person-outline" 
              />
              <CustomInput 
                label="Email Address" 
                value={editEmail} 
                onChangeText={setEditEmail} 
                keyboardType="email-address"
                icon="mail-outline" 
              />
              <PrimaryButton title="Save Changes" onPress={handleSaveProfile} style={{ marginTop: theme.spacing.s }} />
              <SecondaryButton title="Cancel" onPress={() => setIsEditing(false)} style={{ marginTop: theme.spacing.s }} />
            </View>
          ) : (
            <>
              <Text style={styles.name}>{user?.name || 'Agent User'}</Text>
              <Text style={styles.email}>{user?.email || 'agent@example.com'}</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {!isEditing && (
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setEditName(user?.name || 'Agent User');
              setEditEmail(user?.email || 'agent@example.com');
              setIsEditing(true);
            }}>
              <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={24} color={Colors.border} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.border} />
          </TouchableOpacity>
          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.border} />
          </View>
        </View>

        <PrimaryButton 
          title="Logout" 
          onPress={handleLogout} 
          style={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: theme.spacing.m,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.xl,
  },
  editFormContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.m,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    ...theme.shadows.medium,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary || '#4CAF50', // fallback color if secondary is not defined
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  email: {
    ...theme.typography.body1,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    flex: 1,
    ...theme.typography.body1,
    marginLeft: theme.spacing.m,
  },
  logoutButton: {
    backgroundColor: Colors.danger,
  }
});
