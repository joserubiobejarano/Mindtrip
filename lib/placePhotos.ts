/**
 * Shared utility for resolving place photo sources across the application.
 * Handles multiple photo field shapes used in Explore and Itinerary tabs.
 */

/**
 * Checks if a string is a valid Google Places photo_reference.
 * Returns true ONLY for real Google Places photo_reference strings.
 * 
 * Heuristics (must all pass):
 * - ref is a non-empty string, trimmed
 * - ref length >= 30
 * - ref must NOT start with "ChIJ" (place_id)
 * - ref must NOT include spaces
 * - allow common photo_reference prefixes like "AZ" but do not require a specific prefix
 */
export function isGooglePhotoReference(ref: string): boolean {
  if (!ref || typeof ref !== 'string') return false;
  const trimmed = ref.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length < 30) return false;
  if (trimmed.startsWith('ChIJ')) return false; // place_id prefix
  if (trimmed.includes(' ')) return false; // no spaces allowed
  return true;
}

/**
 * Checks if a photo source is usable (non-empty string that's a valid URL or relative path).
 * Type guard that narrows the type to string when returning true.
 */
export function isPhotoSrcUsable(src: any): src is string {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (trimmed.length === 0) return false;
  // Allow relative URLs (starting with /)
  if (trimmed.startsWith('/')) return true;
  // Allow absolute URLs (http/https)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  return false;
}

interface ResolvePhotoOptions {
  usedImageUrls?: Set<string>;
  usedPlaceIds?: Set<string>;
  placeId?: string | null;
  allowDedupedFallback?: boolean; // If true, allows returning a generic image or null if main is duped
}

/**
 * Resolves a place photo source from various input shapes to a usable URL string or null.
 * 
 * Priority order:
 * A) If input is a non-empty string:
 *    - Starts with "/" → return as-is (relative URL)
 *    - Starts with "http://" or "https://" → return as-is
 *    - Otherwise → ONLY convert to proxy URL if isGooglePhotoReference(ref) is true
 *       - If valid: return `/api/places/photo?ref=${encodeURIComponent(input)}`
 *       - If invalid: return null
 * 
 * B) If input is an object:
 *    - Check common fields for already-usable URL: photoUrl, photo_url, imageUrl, image_url, url
 *    - Check Google legacy fields: photo_reference, photoReference, photoRef
 *    - Check arrays: photos, photo, images:
 *       - If it's an array of strings, use first string with the same rules as (A)
 *       - If it's an array of objects, try first item's url then photo_reference/photoReference/photoRef then name
 *    - Check nested place objects: place.place.photos, activity.place.photos, activity.placePhotos, activity.photo
 * 
 * C) If nothing found, return null
 *
 * @param input The input object or string representing a photo source.
 * @param options Options for deduplication and fallback.
 */
export function resolvePlacePhotoSrc(input: any, options?: ResolvePhotoOptions): string | null {
  const { usedImageUrls, usedPlaceIds, placeId, allowDedupedFallback = false } = options || {};

  const checkAndAdd = (url: string, currentPlaceId?: string | null): string | null => {
    if (usedImageUrls && usedImageUrls.has(url)) {
      return null; // Duplicate URL
    }
    if (currentPlaceId && usedPlaceIds && usedPlaceIds.has(currentPlaceId)) {
      return null; // Duplicate primary image for this place ID
    }
    
    // If it's not a duplicate, mark it as used
    if (usedImageUrls) usedImageUrls.add(url);
    if (currentPlaceId && usedPlaceIds) usedPlaceIds.add(currentPlaceId);
    return url;
  };

  const tryResolveAndCheck = (source: any, currentPlaceId?: string | null): string | null => {
    // Recursively call resolvePlacePhotoSrc without deduplication checks for inner resolutions
    // The main checkAndAdd handles the top-level deduplication
    const resolvedUrl = _resolvePlacePhotoSrcInternal(source);
    if (resolvedUrl) {
      return checkAndAdd(resolvedUrl, currentPlaceId);
    }
    return null;
  };

  // Internal helper to avoid infinite recursion for the new options parameter
  const _resolvePlacePhotoSrcInternal = (inputInternal: any): string | null => {
    if (!inputInternal) return null;

    // Case A: Input is a string
    if (typeof inputInternal === 'string') {
      const trimmed = inputInternal.trim();
      if (trimmed.length === 0) return null;
      
      if (trimmed.startsWith('/')) return trimmed;
      
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      
      if (isGooglePhotoReference(trimmed)) {
        return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
      }
      
      return null;
    }

    // Case B: Input is an object
    if (typeof inputInternal === 'object' && inputInternal !== null) {
      // PRIORITY 1: Check image_url first
      if (inputInternal.image_url && typeof inputInternal.image_url === 'string') {
        const trimmed = inputInternal.image_url.trim();
        if (trimmed.length > 0) {
          if (trimmed.startsWith('/')) return trimmed;
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
          }
          if (isGooglePhotoReference(trimmed)) {
            return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
          }
          return trimmed; // Potentially invalid but returned as-is for now
        }
      }
      
      // PRIORITY 1b: Check imageUrl (camelCase variant)
      if (inputInternal.imageUrl && typeof inputInternal.imageUrl === 'string') {
        const trimmed = inputInternal.imageUrl.trim();
        if (trimmed.length > 0) {
          if (trimmed.startsWith('/')) return trimmed;
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
          }
          if (isGooglePhotoReference(trimmed)) {
            return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
          }
          return trimmed;
        }
      }
      
      // PRIORITY 2: Check photos array for photo_reference or ref
      if (inputInternal.photos && Array.isArray(inputInternal.photos) && inputInternal.photos.length > 0) {
        const firstPhoto = inputInternal.photos[0];
        if (typeof firstPhoto === 'string') {
          const resolved = _resolvePlacePhotoSrcInternal(firstPhoto);
          if (resolved) return resolved;
        } else if (typeof firstPhoto === 'object' && firstPhoto !== null) {
          const refValue = firstPhoto.photo_reference || firstPhoto.photoReference || firstPhoto.ref;
          if (refValue && typeof refValue === 'string' && isGooglePhotoReference(refValue)) {
            return `/api/places/photo?ref=${encodeURIComponent(refValue)}`;
          }
        }
      }
      
      // PRIORITY 3: Check other already-usable URL fields
      const urlFields = ['photoUrl', 'photo_url', 'imageUrl', 'url'];
      for (const field of urlFields) {
        const value = inputInternal[field];
        if (value && typeof value === 'string') {
          const resolved = _resolvePlacePhotoSrcInternal(value);
          if (resolved) return resolved;
        }
      }

      // Check for Google legacy photo reference fields
      const refFields = ['photo_reference', 'photoReference', 'photoRef'];
      for (const field of refFields) {
        const value = inputInternal[field];
        if (value && typeof value === 'string') {
          if (isGooglePhotoReference(value)) {
            return `/api/places/photo?ref=${encodeURIComponent(value)}`;
          }
        }
      }

      // Check for array fields: photos, photo, images
      const arrayFields = ['photos', 'photo', 'images'];
      for (const field of arrayFields) {
        const arr = inputInternal[field];
        if (Array.isArray(arr) && arr.length > 0) {
          const firstItem = arr[0];
          
          if (typeof firstItem === 'string') {
            const resolved = _resolvePlacePhotoSrcInternal(firstItem);
            if (resolved) return resolved;
          }
          
          if (typeof firstItem === 'object' && firstItem !== null) {
            if (firstItem.url && typeof firstItem.url === 'string') {
              const resolved = _resolvePlacePhotoSrcInternal(firstItem.url);
              if (resolved) return resolved;
            }
            
            const refValue = firstItem.photo_reference || firstItem.photoReference || firstItem.ref;
            if (refValue && typeof refValue === 'string') {
              if (isGooglePhotoReference(refValue)) {
                return `/api/places/photo?ref=${encodeURIComponent(refValue)}`;
              }
            }
            
            if (firstItem.name && typeof firstItem.name === 'string') {
              if (!firstItem.name.startsWith('http') && !firstItem.name.startsWith('/')) {
                const resolved = _resolvePlacePhotoSrcInternal(firstItem.name);
                if (resolved) return resolved;
              }
            }
          }
        }
      }

      // Check nested place object
      if (inputInternal.place && typeof inputInternal.place === 'object') {
        const resolved = _resolvePlacePhotoSrcInternal(inputInternal.place);
        if (resolved) return resolved;
      }

      // Check activity-specific fields
      if (inputInternal.placePhotos) {
        const resolved = _resolvePlacePhotoSrcInternal(inputInternal.placePhotos);
        if (resolved) return resolved;
      }
      if (inputInternal.photo) {
        const resolved = _resolvePlacePhotoSrcInternal(inputInternal.photo);
        if (resolved) return resolved;
      }
    }

    return null;
  };

  // Main resolution and deduplication logic
  let resolvedPhotoUrl = _resolvePlacePhotoSrcInternal(input);

  if (resolvedPhotoUrl) {
    const checkedUrl = checkAndAdd(resolvedPhotoUrl, placeId);
    if (checkedUrl) {
      return checkedUrl;
    } else if (allowDedupedFallback) {
      // If the main image is a duplicate and fallback is allowed, try a generic or skip
      // For now, simply return null or a generic city image if available (not implemented yet)
      // This is where logic for 'secondary images OR a generic city/neighborhood image OR skip image' would go.
      // For MVP, just returning null.
      return null;
    }
  }

  return null;
}
