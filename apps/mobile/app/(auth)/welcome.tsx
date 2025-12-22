import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SignIn } from '@clerk/clerk-expo';
import { useLanguage } from '@/src/providers/language-provider';

export default function WelcomeScreen() {
  const { t } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('welcome_title' as any)}</Text>
        <Text style={styles.subtitle}>{t('welcome_subtitle' as any)}</Text>
      </View>
      <View style={styles.signInContainer}>
        <SignIn
          afterSignInUrl="/(tabs)/home"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  signInContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});

