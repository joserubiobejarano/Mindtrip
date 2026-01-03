import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/src/providers/language-provider';
import { apiJson } from '@/src/lib/api';
import { getCacheKey, getCachedJson, setCachedJson } from '@/src/lib/cache';
import { containerStyle } from '@/src/lib/responsive';

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  destination_name: string | null;
  owner_id: string;
}

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'offline' | null>(null);
  const { t } = useLanguage();
  const router = useRouter();

  const TRIPS_CACHE_KEY = getCacheKey(['trips', 'list']);

  useEffect(() => {
    loadTripsWithCache();
  }, []);

  const loadTripsWithCache = async () => {
    // Step 1: Load cached trips first
    try {
      const cached = await getCachedJson<{ trips: Trip[] }>(TRIPS_CACHE_KEY);
      if (cached.data && cached.data.trips) {
        setTrips(cached.data.trips);
        setCacheStatus('cached');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading cached trips:', err);
    }

    // Step 2: Always fetch live data
    fetchTrips();
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      setCacheStatus(null);
      const data = await apiJson<{ trips: Trip[] }>('/api/trips');
      setTrips(data.trips || []);
      // Step 3: Cache the successful response
      await setCachedJson(TRIPS_CACHE_KEY, data);
    } catch (err) {
      console.error('Error fetching trips:', err);
      // Step 4: On failure, if we have cached data, keep showing it with offline label
      const cached = await getCachedJson<{ trips: Trip[] }>(TRIPS_CACHE_KEY);
      if (cached.data && cached.data.trips && cached.data.trips.length > 0) {
        setCacheStatus('offline');
      } else {
        // No cache available, show error
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleTripPress = (tripId: string) => {
    router.push(`/(tabs)/trips/${tripId}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('mobile_trips_loading' as any)}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{t('mobile_trips_error' as any)}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>{t('mobile_trips_empty_title' as any)}</Text>
          <Text style={styles.emptyDescription}>{t('mobile_trips_empty_description' as any)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <View style={containerStyle.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('mobile_trips_title' as any)}</Text>
            {cacheStatus && (
              <Text style={styles.statusLabel}>
                {cacheStatus === 'cached' 
                  ? t('mobile_offline_cached' as any) 
                  : t('mobile_offline_no_connection' as any)}
              </Text>
            )}
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => handleTripPress(trip.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tripTitle}>{trip.title || trip.destination_name || 'Untitled Trip'}</Text>
                {trip.start_date && trip.end_date && (
                  <Text style={styles.tripDates}>
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
  statusLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 14,
    color: '#666666',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

