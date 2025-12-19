/**
 * Shared utility for resolving place photo sources across the application.
 * Handles multiple photo field shapes used in Explore and Itinerary tabs.
 */

/**
 * Checks if a photo source is usable (non-empty string that's a valid URL or relative path).
 */
export function isPhotoSrcUsable(src: any): boolean {
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
 *    - Otherwise → treat as legacy Google photo reference → return `/api/places/photo?ref=${encodeURIComponent(input)}`
 * 
 * B) If input is an object:
 *    - Check common fields for already-usable URL: photoUrl, photo_url, imageUrl, image_url, url
 *    - Check Google legacy fields: photo_reference, photoReference
 *    - Check arrays: photos, photo, images:
 *       - If it's an array of strings, use first string with the same rules as (A)
 *       - If it's an array of objects, try first item's url then photo_reference/photoReference then name
 *    - Check nested place objects: if input has place, run resolver on input.place
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
    
    // Treat as legacy Google photo reference
    return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
  }

  // Case B: Input is an object
  if (typeof input === 'object' && input !== null) {
    // Check for already-usable URL fields (priority order)
    const urlFields = ['photoUrl', 'photo_url', 'imageUrl', 'image_url', 'url'];
    for (const field of urlFields) {
      const value = input[field];
      if (value && typeof value === 'string') {
        const resolved = resolvePlacePhotoSrc(value); // Recursively handle string
        if (resolved) return resolved;
      }
    }

    // Check for Google legacy photo reference fields
    const refFields = ['photo_reference', 'photoReference'];
    for (const field of refFields) {
      const value = input[field];
      if (value && typeof value === 'string') {
        return `/api/places/photo?ref=${encodeURIComponent(value)}`;
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
          
          // Try first item's photo_reference or photoReference
          const refValue = firstItem.photo_reference || firstItem.photoReference;
          if (refValue && typeof refValue === 'string') {
            return `/api/places/photo?ref=${encodeURIComponent(refValue)}`;
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

    // Check nested place object
    if (input.place && typeof input.place === 'object') {
      const resolved = resolvePlacePhotoSrc(input.place);
      if (resolved) return resolved;
    }
  }

  // Case C: Nothing found
  return null;
}