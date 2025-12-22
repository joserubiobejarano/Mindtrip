import { View, Text, StyleSheet, Button } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useLanguage } from '@/src/providers/language-provider';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('home_title' as any)}</Text>
        <Text style={styles.welcomeText}>{t('home_welcome' as any)}</Text>
        {user && (
          <Text style={styles.userEmail}>
            {user.emailAddresses[0]?.emailAddress || 'No email'}
          </Text>
        )}
      </View>
      <View style={styles.footer}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  footer: {
    padding: 24,
  },
});

