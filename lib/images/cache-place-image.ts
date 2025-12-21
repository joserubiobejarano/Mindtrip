/**
 * Server-side utility to cache place images in Supabase Storage.
 * Downloads images from Google Places, Unsplash, or generates Mapbox thumbnails,
 * then uploads them to stable Storage URLs.
 */

import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google/places-server';

const BUCKET_NAME = 'place-images';
const isDev = process.env.NODE_ENV === 'development';

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

/**
 * Generate URL-safe slug from title
 */
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

/**
 * Generate hash for filename uniqueness
 */
function generateFileHash(data: Buffer, title: string): string {
  const hash = createHash('md5');
  hash.update(data);
  hash.update(title);
  return hash.digest('hex').substring(0, 8);
}

/**
 * Ensure bucket exists and has public read access
 * Note: Bucket creation may require admin privileges. If creation fails,
 * we assume the bucket exists and continue (it should be created manually or via migration).
 */
async function ensureBucketExists(supabase: Awaited<ReturnType<typeof createClient>>): Promise<void> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      // If we can't list buckets, we'll assume the bucket exists and continue
      // (bucket creation typically requires admin/service role key)
      if (isDev) {
        console.warn('[cache-place-image] Cannot list buckets (may need admin key), assuming bucket exists:', listError.message);
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
        // If creation fails (likely due to missing admin privileges), assume bucket exists
        // Bucket should be created manually or via migration
        if (isDev) {
          console.warn('[cache-place-image] Cannot create bucket (may need admin key), assuming it exists:', createError.message);
        }
        return;
      }

      if (isDev) {
        console.log('[cache-place-image] Bucket created successfully');
      }
    }
  } catch (error: any) {
    // If anything fails, assume bucket exists and continue
    // This allows the system to work even if bucket management requires admin privileges
    if (isDev) {
      console.warn('[cache-place-image] Error checking bucket (assuming it exists):', error?.message || error);
    }
  }
}

/**
 * Upload buffer to Supabase Storage and return public URL
 */
async function uploadToSupabaseStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    // If file already exists, get its public URL
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);
      
      if (publicUrlData?.publicUrl) {
        if (isDev) {
          console.log('[cache-place-image] File already exists, returning existing URL');
        }
        return publicUrlData.publicUrl;
      }
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
 * Fetch image from Google Places Photo API via our proxy
 */
async function fetchGooglePhoto(photoRef: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      if (isDev) {
        console.warn('[cache-place-image] Google Maps API key not configured');
      }
      return null;
    }

    // Use server-side fetch to our photo API endpoint
    // For server-to-server calls, use localhost in development or construct from env
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';
    const photoUrl = `${baseUrl}/api/places/photo?ref=${encodeURIComponent(photoRef)}&maxwidth=1000`;
    
    const response = await fetch(photoUrl, {
      headers: {
        'User-Agent': 'MindTrip-Server/1.0',
      },
    });

    if (!response.ok) {
      if (isDev) {
        console.warn('[cache-place-image] Google photo fetch failed:', response.status);
      }
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Check if we got a placeholder (1x1 transparent PNG is ~67 bytes)
    if (buffer.length < 100) {
      if (isDev) {
        console.warn('[cache-place-image] Received placeholder image, skipping');
      }
      return null;
    }

    return { buffer, contentType };
  } catch (error) {
    if (isDev) {
      console.warn('[cache-place-image] Error fetching Google photo:', error);
    }
    return null;
  }
}

/**
 * Search and fetch image from Unsplash
 */
async function fetchUnsplashImage(query: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!UNSPLASH_ACCESS_KEY) {
      if (isDev) {
        console.warn('[cache-place-image] Unsplash access key not configured');
      }
      return null;
    }

    // Search for images
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!searchResponse.ok) {
      if (isDev) {
        console.warn('[cache-place-image] Unsplash search failed:', searchResponse.status);
      }
      return null;
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      if (isDev) {
        console.warn('[cache-place-image] No Unsplash results found');
      }
      return null;
    }

    // Download the first result (regular size, not raw)
    const imageUrl = searchData.results[0].urls?.regular;
    if (!imageUrl) {
      if (isDev) {
        console.warn('[cache-place-image] No image URL in Unsplash result');
      }
      return null;
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      if (isDev) {
        console.warn('[cache-place-image] Unsplash image download failed:', imageResponse.status);
      }
      return null;
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    if (isDev) {
      console.log('[cache-place-image] Successfully fetched from Unsplash');
    }

    return { buffer, contentType };
  } catch (error) {
    if (isDev) {
      console.warn('[cache-place-image] Error fetching Unsplash image:', error);
    }
    return null;
  }
}

/**
 * Generate Mapbox static map thumbnail
 */
async function generateMapboxThumbnail(lat: number, lng: number): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
    
    if (!MAPBOX_ACCESS_TOKEN) {
      if (isDev) {
        console.warn('[cache-place-image] Mapbox access token not configured');
      }
      return null;
    }

    // Generate static map image (400x300, suitable for thumbnails)
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},14,0/400x300@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    const response = await fetch(mapUrl);
    
    if (!response.ok) {
      if (isDev) {
        console.warn('[cache-place-image] Mapbox thumbnail generation failed:', response.status);
      }
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = 'image/png'; // Mapbox returns PNG

    if (isDev) {
      console.log('[cache-place-image] Successfully generated Mapbox thumbnail');
    }

    return { buffer, contentType };
  } catch (error) {
    if (isDev) {
      console.warn('[cache-place-image] Error generating Mapbox thumbnail:', error);
    }
    return null;
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
  const { tripId, title, city, country, photoRef, lat, lng } = params;

  if (isDev) {
    console.log('[cache-place-image] Starting image cache for:', { title, tripId, hasPhotoRef: !!photoRef });
  }

  try {
    const supabase = await createClient();
    
    // Ensure bucket exists
    await ensureBucketExists(supabase);

    let imageData: { buffer: Buffer; contentType: string } | null = null;
    let source = '';

    // Priority 1: Try Google Places photo
    if (photoRef) {
      imageData = await fetchGooglePhoto(photoRef);
      if (imageData) {
        source = 'google';
        if (isDev) {
          console.log('[cache-place-image] Successfully fetched from Google Places');
        }
      }
    }

    // Priority 2: Try Unsplash search
    if (!imageData) {
      const searchQuery = city ? `${title} ${city}${country ? ` ${country}` : ''}` : title;
      imageData = await fetchUnsplashImage(searchQuery);
      if (imageData) {
        source = 'unsplash';
        if (isDev) {
          console.log('[cache-place-image] Using Unsplash fallback');
        }
      }
    }

    // Priority 3: Try Mapbox static map or placeholder
    if (!imageData) {
      if (lat !== undefined && lng !== undefined) {
        imageData = await generateMapboxThumbnail(lat, lng);
        if (imageData) {
          source = 'mapbox';
          if (isDev) {
            console.log('[cache-place-image] Using Mapbox fallback');
          }
        }
      }
    }

    // If still no image, use placeholder (but we'll return null instead to let UI handle it)
    if (!imageData) {
      if (isDev) {
        console.warn('[cache-place-image] All image sources failed, returning null');
      }
      return null;
    }

    // Determine file extension from content type
    const extension = imageData.contentType.includes('png') ? 'png' : 'jpg';
    
    // Generate storage path
    const slug = slugifyTitle(title);
    const hash = generateFileHash(imageData.buffer, title);
    const storagePath = `trips/${tripId}/${slug}-${hash}.${extension}`;

    // Upload to Supabase Storage
    try {
      const publicUrl = await uploadToSupabaseStorage(
        supabase,
        storagePath,
        imageData.buffer,
        imageData.contentType
      );

      if (isDev) {
        console.log('[cache-place-image] Successfully uploaded to Storage:', { source, publicUrl });
      }

      return publicUrl;
    } catch (uploadError: any) {
      // If file already exists, that's fine - return the existing URL
      if (uploadError.message?.includes('already exists') || uploadError.message?.includes('duplicate')) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);
        
        if (publicUrlData?.publicUrl) {
          if (isDev) {
            console.log('[cache-place-image] File already exists, returning existing URL');
          }
          return publicUrlData.publicUrl;
        }
      }

      if (isDev) {
        console.error('[cache-place-image] Upload failed:', uploadError);
      }
      return null;
    }
  } catch (error) {
    if (isDev) {
      console.error('[cache-place-image] Error in cachePlaceImage:', error);
    }
    return null;
  }
}
