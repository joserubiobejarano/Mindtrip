import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/src/providers/language-provider';
import { apiJson } from '@/src/lib/api';
import { containerStyle } from '@/src/lib/responsive';

const PUSH_TOKEN_REGISTERED_KEY = 'push_token_registered_at';
const LAST_NOTIFICATION_KEY = 'last_notification_payload';
const LAST_DEEP_LINK_KEY = 'last_deep_link';

export default function DebugScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { t, language } = useLanguage();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastRegistration, setLastRegistration] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [lastDeepLink, setLastDeepLink] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      // Load push token
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync(
          process.env.EXPO_PUBLIC_PROJECT_ID
            ? { projectId: process.env.EXPO_PUBLIC_PROJECT_ID }
            : undefined
        );
        setPushToken(tokenData.data || null);
      } catch (error) {
        console.error('[debug] Error getting push token:', error);
        setPushToken(null);
      }

      // Load stored data
      const [registered, notification, deepLink] = await Promise.all([
        AsyncStorage.getItem(PUSH_TOKEN_REGISTERED_KEY),
        AsyncStorage.getItem(LAST_NOTIFICATION_KEY),
        AsyncStorage.getItem(LAST_DEEP_LINK_KEY),
      ]);

      setLastRegistration(registered);
      setLastNotification(notification);
      setLastDeepLink(deepLink);
    } catch (error) {
      console.error('[debug] Error loading debug info:', error);
    }
  };

  const handleRegisterToken = async () => {
    if (!isSignedIn) {
      Alert.alert('Error', 'You must be signed in to register push token');
      return;
    }

    setRegistering(true);
    try {
      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Notification permission denied');
        return;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync(
        process.env.EXPO_PUBLIC_PROJECT_ID
          ? { projectId: process.env.EXPO_PUBLIC_PROJECT_ID }
          : undefined
      );
      const token = tokenData.data;

      if (!token) {
        Alert.alert('Error', 'Failed to get Expo push token');
        return;
      }

      // Detect platform
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      // Send token to backend
      await apiJson('/api/user/push-token', {
        method: 'POST',
        body: JSON.stringify({ token, platform }),
      });

      // Store timestamp
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, timestamp);

      // Update UI
      setPushToken(token);
      setLastRegistration(timestamp);

      Alert.alert('Success', t('mobile_debug_register_success' as any));
    } catch (error: any) {
      console.error('[debug] Error registering push token:', error);
      Alert.alert('Error', t('mobile_debug_register_error' as any));
    } finally {
      setRegistering(false);
    }
  };

  const handleSendTestPush = async () => {
    if (!isSignedIn) {
      Alert.alert('Error', 'You must be signed in to send test push');
      return;
    }

    setSending(true);
    try {
      await apiJson('/api/user/push-test', {
        method: 'POST',
        body: JSON.stringify({ language }),
      });

      Alert.alert('Success', t('mobile_debug_send_success' as any));
    } catch (error: any) {
      console.error('[debug] Error sending test push:', error);
      Alert.alert('Error', t('mobile_debug_send_error' as any));
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return t('mobile_debug_never' as any);
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getNotificationTimestamp = (notificationJson: string | null) => {
    if (!notificationJson) return null;
    try {
      const parsed = JSON.parse(notificationJson);
      return parsed.timestamp || null;
    } catch {
      return null;
    }
  };

  const formatJson = (json: string | null) => {
    if (!json) return t('mobile_debug_never' as any);
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return json;
    }
  };

  return (
    <View style={styles.container}>
      <View style={containerStyle.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('mobile_debug_title' as any)}</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Auth Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mobile_debug_auth_status' as any)}</Text>
            <Text style={styles.value}>
              {!isLoaded ? 'Loading...' : isSignedIn ? t('mobile_debug_signed_in' as any) : t('mobile_debug_signed_out' as any)}
            </Text>
            {isSignedIn && user && (
              <>
                <Text style={styles.label}>{t('mobile_debug_user_id' as any)}</Text>
                <Text style={styles.value}>{user.id}</Text>
              </>
            )}
          </View>

          {/* Push Token */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mobile_debug_push_token' as any)}</Text>
            <Text style={styles.value}>
              {pushToken || t('mobile_debug_token_not_available' as any)}
            </Text>
            {pushToken && (
              <Text style={styles.tokenText} selectable>
                {pushToken}
              </Text>
            )}
          </View>

          {/* Last Registration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mobile_debug_last_registration' as any)}</Text>
            <Text style={styles.value}>{formatTimestamp(lastRegistration)}</Text>
          </View>

          {/* Last Notification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mobile_debug_last_notification' as any)}</Text>
            <Text style={styles.value}>{formatTimestamp(getNotificationTimestamp(lastNotification))}</Text>
            {lastNotification && (
              <Text style={styles.jsonText} selectable>
                {formatJson(lastNotification)}
              </Text>
            )}
          </View>

          {/* Last Deep Link */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mobile_debug_last_deep_link' as any)}</Text>
            <Text style={styles.value}>{lastDeepLink || t('mobile_debug_never' as any)}</Text>
            {lastDeepLink && (
              <Text style={styles.linkText} selectable>
                {lastDeepLink}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.button, registering && styles.buttonDisabled]}
              onPress={handleRegisterToken}
              disabled={registering || !isSignedIn}
            >
              {registering ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>{t('mobile_debug_register_button' as any)}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, sending && styles.buttonDisabled]}
              onPress={handleSendTestPush}
              disabled={sending || !isSignedIn}
            >
              {sending ? (
                <ActivityIndicator color="#1a1a1a" />
              ) : (
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  {t('mobile_debug_send_test_button' as any)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginTop: 8,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  jsonText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  buttonSection: {
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#1a1a1a',
  },
});

