import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/src/providers/language-provider';
import { apiJson, apiFetch } from '@/src/lib/api';
import { getCacheKey, getCachedJson, setCachedJson } from '@/src/lib/cache';

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  destination_name: string | null;
  owner_id: string;
  [key: string]: any;
}

// Itinerary types matching types/itinerary.ts
interface ItineraryPlace {
  id: string;
  name: string;
  description: string;
  area: string;
  neighborhood: string | null;
  photos: string[];
  visited: boolean;
  tags: string[];
  place_id?: string;
  photo_reference?: string;
  image_url?: string | null;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface ItinerarySlot {
  label: TimeOfDay;
  summary: string;
  places: ItineraryPlace[];
}

interface ItineraryDay {
  id: string;
  index: number;
  date: string;
  title: string;
  theme: string;
  areaCluster: string;
  photos: string[];
  overview: string;
  slots: ItinerarySlot[];
}

interface SmartItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tripTips: string[];
}

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripCacheStatus, setTripCacheStatus] = useState<'cached' | 'offline' | null>(null);
  const { t, language } = useLanguage();
  
  // Itinerary state
  const [itinerary, setItinerary] = useState<SmartItinerary | null>(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState<string | null>(null);
  const [itineraryCacheStatus, setItineraryCacheStatus] = useState<'cached' | 'offline' | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTripWithCache();
    }
  }, [tripId]);

  // Load itinerary when trip is loaded (cache-aware)
  useEffect(() => {
    if (tripId && trip) {
      loadItineraryWithCache();
    }
  }, [tripId, trip]);

  const loadTripWithCache = async () => {
    if (!tripId) return;

    const TRIP_CACHE_KEY = getCacheKey(['trip', tripId]);

    // Step 1: Load cached trip first
    try {
      const cached = await getCachedJson<{ trip: Trip }>(TRIP_CACHE_KEY);
      if (cached.data && cached.data.trip) {
        setTrip(cached.data.trip);
        setTripCacheStatus('cached');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading cached trip:', err);
    }

    // Step 2: Always fetch live data
    fetchTrip();
  };

  const fetchTrip = async () => {
    if (!tripId) return;

    const TRIP_CACHE_KEY = getCacheKey(['trip', tripId]);

    try {
      setLoading(true);
      setError(null);
      setTripCacheStatus(null);
      const data = await apiJson<{ trip: Trip }>(`/api/trips/${tripId}`);
      setTrip(data.trip);
      // Step 3: Cache the successful response
      await setCachedJson(TRIP_CACHE_KEY, data);
    } catch (err) {
      console.error('Error fetching trip:', err);
      // Step 4: On failure, if we have cached data, keep showing it with offline label
      const cached = await getCachedJson<{ trip: Trip }>(TRIP_CACHE_KEY);
      if (cached.data && cached.data.trip) {
        setTripCacheStatus('offline');
      } else {
        // No cache available, show error
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadItineraryWithCache = async () => {
    if (!tripId) return;

    const ITINERARY_CACHE_KEY = getCacheKey(['itinerary', tripId]);

    // Step 1: Load cached itinerary first
    try {
      const cached = await getCachedJson<SmartItinerary>(ITINERARY_CACHE_KEY);
      if (cached.data) {
        setItinerary(cached.data);
        setItineraryCacheStatus('cached');
        setItineraryLoading(false);
      }
    } catch (err) {
      console.error('Error loading cached itinerary:', err);
    }

    // Step 2: Always fetch live data
    fetchItinerary();
  };

  const fetchItinerary = async () => {
    if (!tripId) return;

    const ITINERARY_CACHE_KEY = getCacheKey(['itinerary', tripId]);

    try {
      setItineraryLoading(true);
      setItineraryError(null);
      setItineraryCacheStatus(null);
      const data = await apiJson<SmartItinerary>(`/api/trips/${tripId}/smart-itinerary?mode=load`);
      setItinerary(data);
      // Step 3: Cache the successful response
      await setCachedJson(ITINERARY_CACHE_KEY, data);
    } catch (err: any) {
      console.error('Error fetching itinerary:', err);
      // Check if it's a 404 (no itinerary exists) - treat as empty, not error
      const errorMessage = err?.message || '';
      if (errorMessage.includes('404') || errorMessage.includes('not-found')) {
        setItinerary(null);
        setItineraryError(null); // Empty state, not error
      } else {
        // On failure, check for cached data
        const cached = await getCachedJson<SmartItinerary>(ITINERARY_CACHE_KEY);
        if (cached.data) {
          setItineraryCacheStatus('offline');
        } else {
          setItineraryError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    } finally {
      setItineraryLoading(false);
    }
  };

  const generateItinerary = async () => {
    if (!tripId) return;

    try {
      setGenerating(true);
      setItineraryError(null);

      // Make POST request to generate itinerary
      // The backend returns SSE, so we'll read the stream to completion
      const response = await apiFetch(`/api/trips/${tripId}/smart-itinerary`, {
        method: 'POST',
        body: JSON.stringify({ language }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Generation failed: ${response.status} ${errorText}`);
      }

      // Read the SSE stream to completion
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completed = false;

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Look for complete event in SSE format: data: {"type":"complete",...}\n\n
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.substring(6));
                  if (eventData.type === 'complete') {
                    completed = true;
                    break;
                  }
                } catch (e) {
                  // Not JSON, continue
                }
              }
            }
            if (completed) break;
          }
        } catch (streamError) {
          console.error('Error reading SSE stream:', streamError);
          // Continue anyway - we'll fetch the itinerary
        }
      }

      // Wait a brief moment for backend to finish saving
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the newly generated itinerary
      await fetchItinerary();

      // Show success message
      Alert.alert(
        t('mobile_itinerary_generate_success' as any),
        '',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error generating itinerary:', err);
      Alert.alert(
        t('mobile_itinerary_generate_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('mobile_trip_detail_loading' as any)}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{t('mobile_trip_detail_error' as any)}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{t('mobile_trip_detail_error' as any)}</Text>
        </View>
      </View>
    );
  }

  const renderItinerarySection = () => {
    // Loading state
    if (itineraryLoading) {
      return (
        <View style={styles.itinerarySection}>
          <Text style={styles.itineraryTitle}>{t('mobile_itinerary_title' as any)}</Text>
          <View style={styles.itineraryLoadingContainer}>
            <ActivityIndicator size="small" color="#1a1a1a" />
            <Text style={styles.itineraryLoadingText}>{t('mobile_itinerary_loading' as any)}</Text>
          </View>
        </View>
      );
    }

    // Error state
    if (itineraryError) {
      return (
        <View style={styles.itinerarySection}>
          <Text style={styles.itineraryTitle}>{t('mobile_itinerary_title' as any)}</Text>
          <View style={styles.itineraryErrorContainer}>
            <Text style={styles.itineraryErrorText}>{t('mobile_itinerary_error' as any)}</Text>
            <Text style={styles.itineraryErrorDetail}>{itineraryError}</Text>
          </View>
        </View>
      );
    }

    // Empty state (no itinerary exists)
    if (!itinerary) {
      return (
        <View style={styles.itinerarySection}>
          <Text style={styles.itineraryTitle}>{t('mobile_itinerary_title' as any)}</Text>
          <View style={styles.itineraryEmptyContainer}>
            <Text style={styles.itineraryEmptyTitle}>{t('mobile_itinerary_empty_title' as any)}</Text>
            <Text style={styles.itineraryEmptyDescription}>{t('mobile_itinerary_empty_description' as any)}</Text>
            <TouchableOpacity
              style={[styles.generateButton, generating && styles.generateButtonDisabled]}
              onPress={generateItinerary}
              disabled={generating}
              activeOpacity={0.7}
            >
              <Text style={styles.generateButtonText}>
                {generating ? t('mobile_itinerary_generating' as any) : t('mobile_itinerary_generate' as any)}
              </Text>
            </TouchableOpacity>
            <Text style={styles.generateHintText}>{t('mobile_itinerary_generate_hint' as any)}</Text>
          </View>
        </View>
      );
    }

    // Loaded state - render collapsible days
    return (
      <View style={styles.itinerarySection}>
        <View style={styles.itineraryHeader}>
          <Text style={styles.itineraryTitle}>{t('mobile_itinerary_title' as any)}</Text>
          <TouchableOpacity
            style={[styles.regenerateButton, generating && styles.regenerateButtonDisabled]}
            onPress={generateItinerary}
            disabled={generating}
            activeOpacity={0.7}
          >
            <Text style={styles.regenerateButtonText}>
              {generating ? t('mobile_itinerary_generating' as any) : t('mobile_itinerary_regenerate' as any)}
            </Text>
          </TouchableOpacity>
        </View>
        {itinerary.days.map((day) => {
          const isExpanded = expandedDayId === day.id;
          return (
            <View key={day.id} style={styles.dayCard}>
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() => setExpandedDayId(isExpanded ? null : day.id)}
                activeOpacity={0.7}
              >
                <View style={styles.dayHeaderContent}>
                  <Text style={styles.dayNumber}>
                    {t('mobile_itinerary_day' as any).replace('{n}', String(day.index + 1))}
                  </Text>
                  {day.title && <Text style={styles.dayTitle}>{day.title}</Text>}
                  {day.date && (
                    <Text style={styles.dayDate}>
                      {new Date(day.date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.dayChevron}>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>
              
              {isExpanded && (
                <View style={styles.dayContent}>
                  {day.slots.map((slot, slotIndex) => (
                    <View key={slotIndex} style={styles.slotContainer}>
                      <Text style={styles.slotLabel}>
                        {slot.label === 'morning' && t('mobile_itinerary_morning' as any)}
                        {slot.label === 'afternoon' && t('mobile_itinerary_afternoon' as any)}
                        {slot.label === 'evening' && t('mobile_itinerary_evening' as any)}
                      </Text>
                      {slot.summary && (
                        <Text style={styles.slotSummary}>{slot.summary}</Text>
                      )}
                      {slot.places.map((place) => (
                        <View key={place.id} style={styles.placeItem}>
                          <Text style={styles.placeName}>{place.name}</Text>
                          {place.description && (
                            <Text style={styles.placeDescription}>{place.description}</Text>
                          )}
                          {(place.area || place.neighborhood) && (
                            <Text style={styles.placeLocation}>
                              {place.area}{place.neighborhood ? `, ${place.neighborhood}` : ''}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('mobile_trip_detail_title' as any)}</Text>
        {(tripCacheStatus || itineraryCacheStatus) && (
          <Text style={styles.statusLabel}>
            {tripCacheStatus === 'offline' || itineraryCacheStatus === 'offline'
              ? t('mobile_offline_no_connection' as any)
              : tripCacheStatus === 'cached' || itineraryCacheStatus === 'cached'
              ? t('mobile_offline_cached' as any)
              : null}
          </Text>
        )}
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Trip Title</Text>
          <Text style={styles.value}>{trip.title || trip.destination_name || 'Untitled Trip'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Trip ID</Text>
          <Text style={styles.value}>{trip.id}</Text>
        </View>
        {trip.start_date && trip.end_date && (
          <View style={styles.section}>
            <Text style={styles.label}>Dates</Text>
            <Text style={styles.value}>
              {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.exploreButton]}
              onPress={() => router.push(`/trips/${tripId}/explore`)}
              activeOpacity={0.7}
            >
              <Text style={styles.exploreButtonText}>{t('mobile_explore_title' as any)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.expensesButton]}
              onPress={() => router.push(`/trips/${tripId}/expenses`)}
              activeOpacity={0.7}
            >
              <Text style={styles.expensesButtonText}>{t('mobile_expenses_title' as any)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.tripmatesButton]}
              onPress={() => router.push(`/trips/${tripId}/tripmates`)}
              activeOpacity={0.7}
            >
              <Text style={styles.tripmatesButtonText}>{t('mobile_tripmates_title' as any)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderItinerarySection()}
      </ScrollView>
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
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: '#1a1a1a',
  },
  placeholderSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
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
  // Itinerary styles
  itinerarySection: {
    marginTop: 32,
    marginBottom: 24,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  itineraryLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itineraryLoadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666666',
  },
  itineraryErrorContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itineraryErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
  },
  itineraryErrorDetail: {
    fontSize: 14,
    color: '#999999',
  },
  itineraryEmptyContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itineraryEmptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  itineraryEmptyDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#999999',
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateHintText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
  regenerateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  regenerateButtonDisabled: {
    borderColor: '#999999',
    opacity: 0.6,
  },
  regenerateButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  // Day card styles
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dayHeaderContent: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dayTitle: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 14,
    color: '#666666',
  },
  dayChevron: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  dayContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  // Slot styles
  slotContainer: {
    marginTop: 16,
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotSummary: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 20,
  },
  // Place styles
  placeItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  placeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  placeLocation: {
    fontSize: 12,
    color: '#999999',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exploreButton: {
    backgroundColor: '#1a1a1a',
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  expensesButton: {
    backgroundColor: '#1a1a1a',
  },
  expensesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tripmatesButton: {
    backgroundColor: '#1a1a1a',
  },
  tripmatesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

