import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '@/services/profile';
import { Toast, RefreshControl } from '@/components/ui';
import {
  ProfileHeader,
  IdentitySection,
  AccountSection,
  SecuritySection,
  PreferencesSection,
  LogoutSection,
} from '@/components/profile';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, updateUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalProfileImage, setOriginalProfileImage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      const profile = await getProfile();
      
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setProfileImage(profile.profile_image_url || null);

      setOriginalFirstName(profile.first_name || '');
      setOriginalLastName(profile.last_name || '');
      setOriginalEmail(profile.email || '');
      setOriginalProfileImage(profile.profile_image_url || null);
    } catch (error: any) {
      showToast('Error al cargar el perfil', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile(true);
  };


  const hasAccountChanges = useMemo(() => {
    return (
      firstName.trim() !== originalFirstName ||
      lastName.trim() !== originalLastName ||
      email.trim() !== originalEmail ||
      profileImage !== originalProfileImage
    );
  }, [firstName, lastName, email, profileImage, originalFirstName, originalLastName, originalEmail, originalProfileImage]);

  const canChangePassword = useMemo(() => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return false;
    }
    if (newPassword !== confirmPassword) return false;
    if (currentPassword === newPassword) return false;
    if (newPassword.length < 8) return false;
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) return false;
    return true;
  }, [currentPassword, newPassword, confirmPassword]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        profile_image_url: profileImage,
      });

      updateUser({
        ...(updated || {}),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        profile_image_url: profileImage || undefined,
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      });

      setOriginalFirstName(firstName.trim());
      setOriginalLastName(lastName.trim());
      setOriginalEmail(email.trim());
      setOriginalProfileImage(profileImage);

      showToast('Cambios guardados', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChanging(true);
    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      showToast('Contraseña actualizada', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      setChanging(false);
    }
  };

  const handleClearPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error: any) {
      showToast('Error al cerrar sesión', 'error');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            Cargando perfil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ProfileHeader
          title="Perfil"
          subtitle="Administra tu información de cuenta y seguridad"
        />

        <IdentitySection
          firstName={firstName}
          lastName={lastName}
          profileImage={profileImage}
          onImageChange={setProfileImage}
        />

        <AccountSection
          firstName={firstName}
          lastName={lastName}
          email={email}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailChange={setEmail}
          onSave={handleSaveAccount}
          hasChanges={hasAccountChanges}
          saving={saving}
        />

        <SecuritySection
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          onUpdatePassword={handleChangePassword}
          onClear={handleClearPassword}
          canChange={canChangePassword}
          changing={changing}
        />

        <PreferencesSection />

        <LogoutSection onLogout={handleLogout} />
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});

