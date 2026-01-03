import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/src/providers/language-provider';
import { apiJson, apiFetch } from '@/src/lib/api';
import { getCacheKey, clearCacheKey } from '@/src/lib/cache';
import { containerStyle } from '@/src/lib/responsive';

// Type definitions matching web Explore types
interface ExplorePlace {
  place_id: string;
  name: string;
  photo_url: string | null;
  category: string;
  neighborhood: string;
  district: string | null;
  rating: number;
  user_ratings_total: number;
  tags: string[];
  price_level?: number;
  types: string[];
  address: string;
  lat: number;
  lng: number;
}

interface ExploreSession {
  likedPlaces: string[];
  discardedPlaces: string[];
  swipeCount: number;
  remainingSwipes: number | null;
  dailyLimit: number | null;
}

interface ExplorePlacesResponse {
  places: ExplorePlace[];
  hasMore: boolean;
  totalCount: number;
}

interface SmartItinerary {
  title: string;
  summary: string;
  days: {
    id: string;
    index: number;
    date: string;
    title: string;
    theme: string;
    areaCluster: string;
    photos: string[];
    overview: string;
    slots: {
      label: 'morning' | 'afternoon' | 'evening';
      summary: string;
      places: any[];
    }[];
  }[];
  tripTips: string[];
}

type TimeSlot = 'morning' | 'afternoon' | 'evening';

export default function ExploreScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [places, setPlaces] = useState<ExplorePlace[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ExploreSession | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [addingToItinerary, setAddingToItinerary] = useState(false);

  // Fetch places deck
  useEffect(() => {
    if (tripId) {
      fetchPlaces();
      fetchSession();
    }
  }, [tripId]);

  const fetchPlaces = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiJson<ExplorePlacesResponse>(`/api/trips/${tripId}/explore/places`);
      setPlaces(data.places || []);
      setCurrentIndex(0);
    } catch (err: any) {
      console.error('Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async () => {
    if (!tripId) return;

    try {
      const data = await apiJson<ExploreSession>(`/api/trips/${tripId}/explore/session`);
      setSession(data);
    } catch (err: any) {
      console.error('Error fetching session:', err);
      // Session fetch failure is not critical, continue without it
    }
  };

  const handleSwipe = async (action: 'like' | 'dislike') => {
    if (!tripId || swiping) return;
    
    const currentPlace = places[currentIndex];
    if (!currentPlace) return;

    try {
      setSwiping(true);
      
      const response = await apiFetch(`/api/trips/${tripId}/explore/swipe`, {
        method: 'POST',
        body: JSON.stringify({
          place_id: currentPlace.place_id,
          action,
          source: 'trip',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Check for limit reached
        if (errorData.limitReached || errorData.error === 'LIMIT_REACHED') {
          Alert.alert(
            t('mobile_explore_swipe_error' as any),
            'You\'ve reached your swipe limit. Upgrade to Pro for unlimited swipes!',
            [{ text: 'OK' }]
          );
          return;
        }
        
        throw new Error(errorData.error || 'Failed to save swipe');
      }

      const result = await response.json();
      
      // Update session state
      if (result.success) {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            swipeCount: result.swipeCount || prev.swipeCount,
            remainingSwipes: result.remainingSwipes ?? prev.remainingSwipes,
          };
        });
      }

      // Advance to next card
      if (currentIndex < places.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more places, fetch more if available
        // For MVP, just show empty state
        setPlaces([]);
      }
    } catch (err: any) {
      console.error('Error saving swipe:', err);
      Alert.alert(
        t('mobile_explore_swipe_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setSwiping(false);
    }
  };

  const handleAddToItinerary = async () => {
    if (!tripId || addingToItinerary) return;
    
    const currentPlace = places[currentIndex];
    if (!currentPlace) return;

    try {
      // First, fetch itinerary to get day IDs
      let itinerary: SmartItinerary | null = null;
      try {
        itinerary = await apiJson<SmartItinerary>(`/api/trips/${tripId}/smart-itinerary?mode=load`);
      } catch (err: any) {
        // Itinerary might not exist, that's okay - we'll use default day
        console.log('No itinerary found, will use default day');
      }

      // Show time slot picker
      const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];
      const timeSlotLabels = timeSlots.map(slot => {
        if (slot === 'morning') return t('mobile_explore_morning' as any);
        if (slot === 'afternoon') return t('mobile_explore_afternoon' as any);
        return t('mobile_explore_evening' as any);
      });

      // Determine default day ID
      let dayId: string | null = null;
      if (itinerary && itinerary.days && itinerary.days.length > 0) {
        dayId = itinerary.days[0].id; // Use first day
      } else {
        // If no itinerary, we need to get days from the trip
        // For MVP, we'll show an error if no itinerary exists
        Alert.alert(
          t('mobile_explore_added_error' as any),
          'Please generate an itinerary first before adding places.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!dayId) {
        Alert.alert(
          t('mobile_explore_added_error' as any),
          'Could not find a day to add the place to.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show time slot picker
      Alert.alert(
        t('mobile_explore_select_time' as any),
        'Choose when to visit this place:',
        [
          ...timeSlotLabels.map((label, index) => ({
            text: label,
            onPress: () => addPlaceToDay(currentPlace, dayId!, timeSlots[index]),
          })),
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      console.error('Error preparing add to itinerary:', err);
      Alert.alert(
        t('mobile_explore_added_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    }
  };

  const addPlaceToDay = async (place: ExplorePlace, dayId: string, slot: TimeSlot) => {
    if (!tripId) return;

    try {
      setAddingToItinerary(true);

      const response = await apiFetch(`/api/trips/${tripId}/days/${dayId}/activities/bulk-add-from-swipes`, {
        method: 'POST',
        body: JSON.stringify({
          place_ids: [place.place_id],
          slot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Failed to add place to itinerary');
      }

      const result = await response.json();

      // Clear itinerary cache since it has been modified
      // TODO: Consider implementing a more sophisticated cache invalidation system
      // that can refresh the itinerary cache immediately instead of clearing it
      const ITINERARY_CACHE_KEY = getCacheKey(['itinerary', tripId]);
      await clearCacheKey(ITINERARY_CACHE_KEY);

      // Show success message
      Alert.alert(
        t('mobile_explore_added_success' as any),
        '',
        [
          {
            text: 'OK',
            onPress: () => {
              // Auto-like the place
              handleSwipe('like');
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Error adding place to itinerary:', err);
      Alert.alert(
        t('mobile_explore_added_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setAddingToItinerary(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_explore_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('mobile_explore_loading' as any)}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_explore_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{t('mobile_explore_error' as any)}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPlaces}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state
  if (places.length === 0 || currentIndex >= places.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_explore_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>{t('mobile_explore_empty_title' as any)}</Text>
          <Text style={styles.emptyDescription}>{t('mobile_explore_empty_description' as any)}</Text>
        </View>
      </View>
    );
  }

  // Main content - show current card
  const currentPlace = places[currentIndex];
  const isDisabled = swiping || addingToItinerary || (session?.remainingSwipes !== null && (session.remainingSwipes || 0) <= 0);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <View style={containerStyle.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('mobile_explore_title' as any)}</Text>
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.cardContainer}>
        <View style={styles.card}>
          {currentPlace.photo_url && (
            <Image source={{ uri: currentPlace.photo_url }} style={styles.cardImage} />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{currentPlace.name}</Text>
            
            <View style={styles.cardMeta}>
              {currentPlace.rating > 0 && (
                <Text style={styles.cardRating}>
                  ⭐ {currentPlace.rating.toFixed(1)}
                  {currentPlace.user_ratings_total > 0 && ` (${currentPlace.user_ratings_total})`}
                </Text>
              )}
              {currentPlace.price_level !== undefined && (
                <Text style={styles.cardPrice}>
                  {'$'.repeat(currentPlace.price_level + 1)}
                </Text>
              )}
            </View>

            {currentPlace.category && (
              <Text style={styles.cardCategory}>{currentPlace.category}</Text>
            )}

            {currentPlace.neighborhood && (
              <Text style={styles.cardNeighborhood}>📍 {currentPlace.neighborhood}</Text>
            )}

            {currentPlace.address && (
              <Text style={styles.cardAddress}>{currentPlace.address}</Text>
            )}

            {currentPlace.tags && currentPlace.tags.length > 0 && (
              <View style={styles.cardTags}>
                {currentPlace.tags.slice(0, 2).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.skipButton, isDisabled && styles.buttonDisabled]}
          onPress={() => handleSwipe('dislike')}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>{t('mobile_explore_skip' as any)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, isDisabled && styles.buttonDisabled]}
          onPress={handleAddToItinerary}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>{t('mobile_explore_add_to_itinerary' as any)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.likeButton, isDisabled && styles.buttonDisabled]}
          onPress={() => handleSwipe('like')}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <Text style={styles.likeButtonText}>{t('mobile_explore_like' as any)}</Text>
        </TouchableOpacity>
      </View>

          {/* Swipe counter */}
          {session && session.remainingSwipes !== null && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {session.remainingSwipes} {session.remainingSwipes === 1 ? 'swipe' : 'swipes'} remaining
              </Text>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  cardContent: {
    padding: 16,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  cardRating: {
    fontSize: 14,
    color: '#666666',
  },
  cardPrice: {
    fontSize: 14,
    color: '#666666',
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardNeighborhood: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  likeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  likeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  counter: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 12,
    color: '#999999',
  },
});

