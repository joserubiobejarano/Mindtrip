/**
 * Server-side utility to cache place images in Supabase Storage.
 * Downloads images from Google Places, Unsplash, or generates Mapbox thumbnails,
 * then uploads them to stable Storage URLs.
 * 
 * Uses Supabase service role client for all storage operations to bypass RLS.
 */

import 'server-only';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { createHash } from 'crypto';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';

const BUCKET_NAME = 'place-images';
const isDev = process.env.NODE_ENV === 'development';

// Startup health check: warn if service role key is missing
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[cache-place-image] ⚠️  SUPABASE_SERVICE_ROLE_KEY is missing. Image uploads will fail. ' +
    'Add this to your environment variables.'
  );
}

export interface CachePlaceImageParams {
  tripId: string;
  placeId?: string;
  title: string;
  city?: string;
  country?: string;
  photoRef?: string;
  lat?: number;
  lng?: number;
}

export type ImageProvider = 'google' | 'unsplash' | 'mapbox' | 'placeholder';

export interface ProviderAttempt {
  provider: ImageProvider;
  ok: boolean;
  status?: number;
  reason?: string;
  debugUrl?: string; // sanitized URL without secrets
}

export interface CachePlaceImageResult {
  publicUrl: string | null;
  providerUsed: ImageProvider | null;
  uploadOk: boolean;
  error: string | null;
  attempts: ProviderAttempt[]; // track all attempts
}

/**
 * Sanitize URL by removing API keys, tokens, and secrets
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common secret parameters
    const secretParams = ['key', 'api_key', 'access_token', 'token', 'apikey', 'auth'];
    secretParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '***REDACTED***');
      }
    });
    return urlObj.toString();
  } catch {
    // If URL parsing fails, try to remove common patterns
    return url
      .replace(/[?&](key|api_key|access_token|token|apikey|auth)=[^&]*/gi, '=$1=***REDACTED***')
      .substring(0, 500); // Limit length
  }
}

/**
 * Truncate response text to max length
 */
function truncateResponse(text: string, maxLength: number = 300): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate deterministic hash for file path based on place identity
 */
function generatePlaceHash(placeId: string | undefined, title: string, lat: number | undefined, lng: number | undefined): string {
  const hash = createHash('sha1');
  const input = `${placeId || ''}|${title}|${lat || ''}|${lng || ''}`;
  hash.update(input);
  return hash.digest('hex').substring(0, 16);
}

/**
 * Ensure bucket exists and has public read access
 * Uses service role client, so it should have permissions to create buckets.
 */
async function ensureBucketExists(supabase: ReturnType<typeof createSupabaseAdmin>): Promise<void> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      if (isDev) {
        console.warn('[cache-place-image] Cannot list buckets:', listError.message);
        console.warn('[cache-place-image] Assuming bucket exists. If uploads fail, create the bucket manually in Supabase dashboard.');
      }
      return;
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      if (isDev) {
        console.log('[cache-place-image] Bucket not found, attempting to create:', BUCKET_NAME);
      }
      
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      if (createError) {
        if (isDev) {
          console.warn('[cache-place-image] Cannot create bucket programmatically:', createError.message);
          console.warn('[cache-place-image] Please create the bucket manually in Supabase dashboard:');
          console.warn(`[cache-place-image]   1. Go to Storage > Buckets`);
          console.warn(`[cache-place-image]   2. Create bucket "${BUCKET_NAME}"`);
          console.warn(`[cache-place-image]   3. Set it to PUBLIC`);
        }
        // Continue assuming bucket exists - if upload fails, we'll throw a clear error
        return;
      }

      if (isDev) {
        console.log('[cache-place-image] ✅ Bucket created successfully');
      }
    } else {
      // Check if bucket is public (we can't set it programmatically if it's not)
      const bucket = buckets.find(b => b.name === BUCKET_NAME);
      if (bucket && !bucket.public && isDev) {
        console.warn('[cache-place-image] ⚠️  Bucket exists but may not be public. Set bucket to PUBLIC in Supabase dashboard.');
      }
    }
  } catch (error: any) {
    if (isDev) {
      console.warn('[cache-place-image] Error checking bucket (assuming it exists):', error?.message || error);
    }
  }
}

/**
 * Convert image buffer to JPEG if needed
 * Returns buffer and ensures it's JPEG format
 */
async function ensureJpegFormat(buffer: Buffer, originalContentType: string): Promise<Buffer> {
  // If already JPEG, return as-is
  if (originalContentType.includes('jpeg') || originalContentType.includes('jpg')) {
    return buffer;
  }

  // For PNG/WebP, we'll keep the original format but store as .jpg extension
  // This is acceptable since browsers handle it, but ideally we'd convert
  // For now, return as-is since conversion requires sharp or similar library
  // TODO: Consider adding image conversion library if needed
  return buffer;
}

/**
 * Upload buffer to Supabase Storage and return public URL
 */
async function uploadToSupabaseStorage(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  // Ensure JPEG format
  const jpegBuffer = await ensureJpegFormat(buffer, contentType);
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, jpegBuffer, {
      contentType: 'image/jpeg', // Always store as JPEG
      cacheControl: '3600',
      upsert: true, // Overwrite existing files
    });

  if (error) {
    // Check for bucket not found error
    if (error.message?.toLowerCase().includes('bucket') && error.message?.toLowerCase().includes('not found')) {
      throw new Error(
        `Bucket "${BUCKET_NAME}" not found. Please create it in Supabase dashboard: ` +
        `1. Go to Storage > Buckets, 2. Create bucket "${BUCKET_NAME}", 3. Set it to PUBLIC`
      );
    }
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to get public URL after upload');
  }

  return publicUrlData.publicUrl;
}

/**
 * Fetch image directly from Google Places Photo API (server-side)
 * Returns result with attempt details for debugging
 */
async function fetchGooglePhoto(photoRef: string): Promise<{ 
  buffer: Buffer; 
  contentType: string;
  attempt: ProviderAttempt;
} | null> {
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photo_reference=${encodeURIComponent(photoRef)}&key=${GOOGLE_MAPS_API_KEY}`;
  const sanitizedUrl = sanitizeUrl(photoUrl);
  
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      const attempt: ProviderAttempt = {
        provider: 'google',
        ok: false,
        reason: 'Google Maps API key not configured',
        debugUrl: sanitizedUrl,
      };
      if (isDev) {
        console.warn('[cache-place-image] Google Maps API key not configured');
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    if (isDev) {
      console.log('[cache-place-image] [Google] Attempting fetch:', sanitizedUrl);
    }

    // Fetch directly from Google Places Photo API (server-side only)
    const response = await fetch(photoUrl, {
      headers: {
        'User-Agent': 'MindTrip-Server/1.0',
      },
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const text = await response.text();
        errorText = truncateResponse(text);
      } catch {
        errorText = response.statusText || 'Unknown error';
      }
      
      const attempt: ProviderAttempt = {
        provider: 'google',
        ok: false,
        status: response.status,
        reason: `HTTP ${response.status}: ${errorText}`,
        debugUrl: sanitizedUrl,
      };
      
      if (isDev) {
        console.warn('[cache-place-image] [Google] Fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: sanitizedUrl,
        });
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Check if we got a placeholder or error response (usually JSON error)
    if (buffer.length < 100) {
      const attempt: ProviderAttempt = {
        provider: 'google',
        ok: false,
        status: response.status,
        reason: 'Response too small (likely placeholder or error)',
        debugUrl: sanitizedUrl,
      };
      if (isDev) {
        console.warn('[cache-place-image] [Google] Received placeholder or error response, skipping');
      }
      return { buffer, contentType, attempt };
    }

    // Check if response is JSON (error response)
    try {
      const text = buffer.toString('utf-8');
      if (text.trim().startsWith('{')) {
        const errorText = truncateResponse(text);
        const attempt: ProviderAttempt = {
          provider: 'google',
          ok: false,
          status: response.status,
          reason: `JSON error response: ${errorText}`,
          debugUrl: sanitizedUrl,
        };
        if (isDev) {
          console.warn('[cache-place-image] [Google] Returned JSON error:', errorText);
        }
        return { buffer, contentType, attempt };
      }
    } catch {
      // Not JSON, continue
    }

    const attempt: ProviderAttempt = {
      provider: 'google',
      ok: true,
      status: response.status,
      debugUrl: sanitizedUrl,
    };

    if (isDev) {
      console.log('[cache-place-image] [Google] ✅ Successfully fetched:', {
        status: response.status,
        size: buffer.length,
        contentType,
      });
    }

    return { buffer, contentType, attempt };
  } catch (error: any) {
    const attempt: ProviderAttempt = {
      provider: 'google',
      ok: false,
      reason: error?.message || 'Unknown error',
      debugUrl: sanitizedUrl,
    };
    if (isDev) {
      console.warn('[cache-place-image] [Google] Error fetching photo:', {
        error: error?.message || error,
        url: sanitizedUrl,
      });
    }
    return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
  }
}

/**
 * Search and fetch image from Unsplash
 * Returns result with attempt details for debugging
 */
async function fetchUnsplashImage(query: string): Promise<{ 
  buffer: Buffer; 
  contentType: string;
  attempt: ProviderAttempt;
} | null> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    
    // Search for images - using correct endpoint and headers
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const sanitizedSearchUrl = sanitizeUrl(searchUrl);
    
    if (!UNSPLASH_ACCESS_KEY) {
      const attempt: ProviderAttempt = {
        provider: 'unsplash',
        ok: false,
        reason: 'Unsplash access key not configured',
        debugUrl: sanitizedSearchUrl,
      };
      if (isDev) {
        console.warn('[cache-place-image] Unsplash access key not configured');
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    if (isDev) {
      console.log('[cache-place-image] [Unsplash] Attempting search:', {
        query,
        url: sanitizedSearchUrl,
      });
    }

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!searchResponse.ok) {
      let errorText = '';
      try {
        const text = await searchResponse.text();
        errorText = truncateResponse(text);
      } catch {
        errorText = searchResponse.statusText || 'Unknown error';
      }
      
      const attempt: ProviderAttempt = {
        provider: 'unsplash',
        ok: false,
        status: searchResponse.status,
        reason: `Search failed: HTTP ${searchResponse.status}: ${errorText}`,
        debugUrl: sanitizedSearchUrl,
      };
      
      if (isDev) {
        console.warn('[cache-place-image] [Unsplash] Search failed:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          error: errorText,
          url: sanitizedSearchUrl,
        });
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      const attempt: ProviderAttempt = {
        provider: 'unsplash',
        ok: false,
        status: searchResponse.status,
        reason: `No results found for query: ${query}`,
        debugUrl: sanitizedSearchUrl,
      };
      if (isDev) {
        console.warn('[cache-place-image] [Unsplash] No results found for query:', query);
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    // Download the first result (regular size, not raw)
    const imageUrl = searchData.results[0].urls?.regular;
    if (!imageUrl) {
      const attempt: ProviderAttempt = {
        provider: 'unsplash',
        ok: false,
        status: searchResponse.status,
        reason: 'No image URL in Unsplash result',
        debugUrl: sanitizedSearchUrl,
      };
      if (isDev) {
        console.warn('[cache-place-image] [Unsplash] No image URL in result');
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    const sanitizedImageUrl = sanitizeUrl(imageUrl);
    if (isDev) {
      console.log('[cache-place-image] [Unsplash] Downloading image:', sanitizedImageUrl);
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      let errorText = '';
      try {
        const text = await imageResponse.text();
        errorText = truncateResponse(text);
      } catch {
        errorText = imageResponse.statusText || 'Unknown error';
      }
      
      const attempt: ProviderAttempt = {
        provider: 'unsplash',
        ok: false,
        status: imageResponse.status,
        reason: `Image download failed: HTTP ${imageResponse.status}: ${errorText}`,
        debugUrl: sanitizedImageUrl,
      };
      
      if (isDev) {
        console.warn('[cache-place-image] [Unsplash] Image download failed:', {
          status: imageResponse.status,
          error: errorText,
        });
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const attempt: ProviderAttempt = {
      provider: 'unsplash',
      ok: true,
      status: imageResponse.status,
      debugUrl: sanitizedImageUrl,
    };

    if (isDev) {
      console.log('[cache-place-image] [Unsplash] ✅ Successfully fetched:', {
        status: imageResponse.status,
        size: buffer.length,
        contentType,
      });
    }

    return { buffer, contentType, attempt };
  } catch (error: any) {
    const attempt: ProviderAttempt = {
      provider: 'unsplash',
      ok: false,
      reason: error?.message || 'Unknown error',
    };
    if (isDev) {
      console.warn('[cache-place-image] [Unsplash] Error fetching image:', {
        error: error?.message || error,
      });
    }
    return { buffer: Buffer.alloc(0), contentType: 'image/jpeg', attempt };
  }
}

/**
 * Generate Mapbox static map thumbnail
 * Returns result with attempt details for debugging
 * Uses MAPBOX_ACCESS_TOKEN (server-side, not NEXT_PUBLIC)
 */
async function generateMapboxThumbnail(lat: number, lng: number): Promise<{ 
  buffer: Buffer; 
  contentType: string;
  attempt: ProviderAttempt;
} | null> {
  try {
    // Use MAPBOX_ACCESS_TOKEN (server-side, not NEXT_PUBLIC)
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
    
    // Generate static map image (400x300, suitable for thumbnails)
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},14,0/400x300@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
    const sanitizedUrl = sanitizeUrl(mapUrl);
    
    if (!MAPBOX_ACCESS_TOKEN) {
      const attempt: ProviderAttempt = {
        provider: 'mapbox',
        ok: false,
        reason: 'Mapbox access token not configured',
        debugUrl: sanitizedUrl,
      };
      if (isDev) {
        console.warn('[cache-place-image] Mapbox access token not configured');
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/png', attempt };
    }

    if (isDev) {
      console.log('[cache-place-image] [Mapbox] Attempting thumbnail generation:', {
        lat,
        lng,
        url: sanitizedUrl,
      });
    }
    
    const response = await fetch(mapUrl);
    
    if (!response.ok) {
      let errorText = '';
      try {
        const text = await response.text();
        errorText = truncateResponse(text);
      } catch {
        errorText = response.statusText || 'Unknown error';
      }
      
      const attempt: ProviderAttempt = {
        provider: 'mapbox',
        ok: false,
        status: response.status,
        reason: `Thumbnail generation failed: HTTP ${response.status}: ${errorText}`,
        debugUrl: sanitizedUrl,
      };
      
      if (isDev) {
        console.warn('[cache-place-image] [Mapbox] Thumbnail generation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: sanitizedUrl,
        });
      }
      return { buffer: Buffer.alloc(0), contentType: 'image/png', attempt };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = 'image/png'; // Mapbox returns PNG

    const attempt: ProviderAttempt = {
      provider: 'mapbox',
      ok: true,
      status: response.status,
      debugUrl: sanitizedUrl,
    };

    if (isDev) {
      console.log('[cache-place-image] [Mapbox] ✅ Successfully generated thumbnail:', {
        status: response.status,
        size: buffer.length,
        contentType,
      });
    }

    return { buffer, contentType, attempt };
  } catch (error: any) {
    const attempt: ProviderAttempt = {
      provider: 'mapbox',
      ok: false,
      reason: error?.message || 'Unknown error',
    };
    if (isDev) {
      console.warn('[cache-place-image] [Mapbox] Error generating thumbnail:', {
        error: error?.message || error,
      });
    }
    return { buffer: Buffer.alloc(0), contentType: 'image/png', attempt };
  }
}

/**
 * Generate a neutral placeholder image (1x1 transparent PNG)
 */
function generatePlaceholder(): { buffer: Buffer; contentType: string } {
  // 1x1 transparent PNG
  const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return {
    buffer: Buffer.from(placeholderBase64, 'base64'),
    contentType: 'image/png',
  };
}

/**
 * Main function to cache a place image
 * Returns stable Supabase Storage URL or null if all fallbacks fail
 */
export async function cachePlaceImage(params: CachePlaceImageParams): Promise<string | null> {
  const result = await cachePlaceImageWithDetails(params);
  return result.publicUrl;
}

/**
 * Main function to cache a place image with detailed result
 * Returns result object with provider info and error details
 */
export async function cachePlaceImageWithDetails(params: CachePlaceImageParams): Promise<CachePlaceImageResult> {
  const { tripId, placeId, title, city, country, photoRef, lat, lng } = params;
  const attempts: ProviderAttempt[] = [];

  if (isDev) {
    console.log('[cache-place-image] Starting image cache for:', { 
      title, 
      city,
      country,
      tripId, 
      placeId: placeId?.substring(0, 20),
      hasPhotoRef: !!photoRef,
      hasCoords: lat !== undefined && lng !== undefined
    });
  }

  // Check for service role key
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const error = 'SUPABASE_SERVICE_ROLE_KEY is missing. Cannot upload images.';
    if (isDev) {
      console.error('[cache-place-image]', error);
    }
    return {
      publicUrl: null,
      providerUsed: null,
      uploadOk: false,
      error,
      attempts: [],
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    
    // Ensure bucket exists
    await ensureBucketExists(supabase);

    let imageData: { buffer: Buffer; contentType: string; attempt: ProviderAttempt } | null = null;
    let provider: ImageProvider | null = null;

    // Priority 1: Try Google Places photo (if photo_reference exists, use it directly)
    if (photoRef) {
      if (isDev) {
        console.log('[cache-place-image] [Priority 1] Attempting Google Places photo with photo_reference...');
      }
      const result = await fetchGooglePhoto(photoRef);
      if (result) {
        attempts.push(result.attempt);
        if (result.attempt.ok && result.buffer.length > 100) {
          imageData = result;
          provider = 'google';
          if (isDev) {
            console.log('[cache-place-image] [Priority 1] ✅ Google photo fetched successfully');
          }
        } else {
          if (isDev) {
            console.warn('[cache-place-image] [Priority 1] ❌ Google photo failed:', result.attempt.reason);
          }
        }
      }
    }

    // Priority 2: Try Unsplash search
    if (!imageData) {
      const searchQuery = city ? `${title} ${city}${country ? ` ${country}` : ''}` : title;
      if (isDev) {
        console.log('[cache-place-image] [Priority 2] Attempting Unsplash search:', searchQuery);
      }
      const result = await fetchUnsplashImage(searchQuery);
      if (result) {
        attempts.push(result.attempt);
        if (result.attempt.ok && result.buffer.length > 100) {
          imageData = result;
          provider = 'unsplash';
          if (isDev) {
            console.log('[cache-place-image] [Priority 2] ✅ Unsplash image fetched successfully');
          }
        } else {
          if (isDev) {
            console.warn('[cache-place-image] [Priority 2] ❌ Unsplash search failed:', result.attempt.reason);
          }
        }
      }
    }

    // Priority 3: Try Mapbox static map
    if (!imageData) {
      if (lat !== undefined && lng !== undefined) {
        if (isDev) {
          console.log('[cache-place-image] [Priority 3] Attempting Mapbox thumbnail...');
        }
        const result = await generateMapboxThumbnail(lat, lng);
        if (result) {
          attempts.push(result.attempt);
          if (result.attempt.ok && result.buffer.length > 100) {
            imageData = result;
            provider = 'mapbox';
            if (isDev) {
              console.log('[cache-place-image] [Priority 3] ✅ Mapbox thumbnail generated successfully');
            }
          } else {
            if (isDev) {
              console.warn('[cache-place-image] [Priority 3] ❌ Mapbox thumbnail generation failed:', result.attempt.reason);
            }
          }
        }
      } else {
        attempts.push({
          provider: 'mapbox',
          ok: false,
          reason: 'Skipped (no coordinates)',
        });
      }
    }

    // If still no image, return null (don't use placeholder - let UI handle it)
    if (!imageData) {
      const error = 'All image sources failed';
      if (isDev) {
        console.warn('[cache-place-image] ❌ All image sources failed');
        console.warn('[cache-place-image] Attempts summary:', attempts.map(a => ({
          provider: a.provider,
          ok: a.ok,
          reason: a.reason,
        })));
      }
      return {
        publicUrl: null,
        providerUsed: null,
        uploadOk: false,
        error,
        attempts,
      };
    }

    // Generate deterministic storage path
    const placeHash = generatePlaceHash(placeId, title, lat, lng);
    const storagePath = `place-images/${provider}/${placeHash}.jpg`;

    if (isDev) {
      console.log('[cache-place-image] Uploading to storage path:', storagePath);
    }

    // Upload to Supabase Storage
    try {
      const publicUrl = await uploadToSupabaseStorage(
        supabase,
        storagePath,
        imageData.buffer,
        imageData.contentType
      );

      if (isDev) {
        console.log('[cache-place-image] ✅ Successfully uploaded to Storage:', { 
          provider, 
          publicUrl: publicUrl.substring(0, 80) + '...',
          path: storagePath
        });
      }

      return {
        publicUrl,
        providerUsed: provider,
        uploadOk: true,
        error: null,
        attempts,
      };
    } catch (uploadError: any) {
      const error = uploadError.message || 'Upload failed';
      if (isDev) {
        console.error('[cache-place-image] ❌ Upload failed:', error);
      }
      return {
        publicUrl: null,
        providerUsed: provider,
        uploadOk: false,
        error,
        attempts,
      };
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    if (isDev) {
      console.error('[cache-place-image] ❌ Error in cachePlaceImage:', errorMessage);
    }
    return {
      publicUrl: null,
      providerUsed: null,
      uploadOk: false,
      error: errorMessage,
      attempts,
    };
  }
}
