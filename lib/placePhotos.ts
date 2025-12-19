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
 */
export function resolvePlacePhotoSrc(input: any): string | null {
  if (!input) return null;

  // Case A: Input is a string
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length === 0) return null;
    
    // Already a relative URL
    if (trimmed.startsWith('/')) return trimmed;
    
    // Already an absolute URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Only convert to proxy URL if it's a valid Google photo reference
    if (isGooglePhotoReference(trimmed)) {
      return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
    }
    
    // Invalid photo reference, return null
    return null;
  }

  // Case B: Input is an object
  if (typeof input === 'object' && input !== null) {
    // PRIORITY 1: Check image_url first (from activities table) - if present and usable, return immediately
    // This avoids trying to resolve place.photos which don't serialize properly
    if (input.image_url && typeof input.image_url === 'string') {
      const trimmed = input.image_url.trim();
      if (trimmed.length > 0) {
        // Already a relative URL
        if (trimmed.startsWith('/')) return trimmed;
        // Already an absolute URL
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        // If it's a Google photo reference, convert to proxy URL
        if (isGooglePhotoReference(trimmed)) {
          return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
        }
        // If it's a valid URL format, return as-is
        return trimmed;
      }
    }
    
    // PRIORITY 2: Check other already-usable URL fields
    const urlFields = ['photoUrl', 'photo_url', 'imageUrl', 'url'];
    for (const field of urlFields) {
      const value = input[field];
      if (value && typeof value === 'string') {
        const resolved = resolvePlacePhotoSrc(value); // Recursively handle string
        if (resolved) return resolved;
      }
    }

    // Check for Google legacy photo reference fields
    const refFields = ['photo_reference', 'photoReference', 'photoRef'];
    for (const field of refFields) {
      const value = input[field];
      if (value && typeof value === 'string') {
        // Only convert to proxy URL if it's a valid Google photo reference
        if (isGooglePhotoReference(value)) {
          return `/api/places/photo?ref=${encodeURIComponent(value)}`;
        }
        // Invalid photo reference, continue to next field
      }
    }

    // Check for array fields: photos, photo, images
    const arrayFields = ['photos', 'photo', 'images'];
    for (const field of arrayFields) {
      const arr = input[field];
      if (Array.isArray(arr) && arr.length > 0) {
        const firstItem = arr[0];
        
        // Array of strings
        if (typeof firstItem === 'string') {
          const resolved = resolvePlacePhotoSrc(firstItem); // Recursively handle string
          if (resolved) return resolved;
        }
        
        // Array of objects
        if (typeof firstItem === 'object' && firstItem !== null) {
          // Try first item's url field
          if (firstItem.url && typeof firstItem.url === 'string') {
            const resolved = resolvePlacePhotoSrc(firstItem.url);
            if (resolved) return resolved;
          }
          
          // Try first item's photo_reference, photoReference, or photoRef
          const refValue = firstItem.photo_reference || firstItem.photoReference || firstItem.photoRef;
          if (refValue && typeof refValue === 'string') {
            // Only convert to proxy URL if it's a valid Google photo reference
            if (isGooglePhotoReference(refValue)) {
              return `/api/places/photo?ref=${encodeURIComponent(refValue)}`;
            }
            // Invalid photo reference, continue to next field
          }
          
          // Try first item's name (unlikely but possible)
          if (firstItem.name && typeof firstItem.name === 'string') {
            // Only treat as photo reference if it doesn't look like a URL
            if (!firstItem.name.startsWith('http') && !firstItem.name.startsWith('/')) {
              const resolved = resolvePlacePhotoSrc(firstItem.name);
              if (resolved) return resolved;
            }
          }
        }
      }
    }

    // Check nested place object (place.place.photos, activity.place.photos)
    if (input.place && typeof input.place === 'object') {
      const resolved = resolvePlacePhotoSrc(input.place);
      if (resolved) return resolved;
    }

    // Check activity-specific fields: activity.placePhotos, activity.photo
    if (input.placePhotos) {
      const resolved = resolvePlacePhotoSrc(input.placePhotos);
      if (resolved) return resolved;
    }
    if (input.photo) {
      const resolved = resolvePlacePhotoSrc(input.photo);
      if (resolved) return resolved;
    }
  }

  // Case C: Nothing found
  return null;
}