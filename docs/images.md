# Image Caching System

This document describes the production-proof image caching system that stores place images in Supabase Storage.

## Overview

The image caching system downloads images from multiple sources (Google Places, Unsplash, Mapbox) and uploads them to Supabase Storage for stable, public URLs. All uploads use the Supabase service role client to bypass RLS and ensure consistent access.

## Environment Variables

### Required (Server-Only)

Add these to your Vercel project settings or `.env.local`:

- **`SUPABASE_SERVICE_ROLE_KEY`** (REQUIRED)
  - Service role key from Supabase Dashboard > Settings > API
  - Used for all storage uploads and bucket management
  - **Never expose this to the client**
  - Without this, image uploads will fail

- **`NEXT_PUBLIC_SUPABASE_URL`** (REQUIRED)
  - Your Supabase project URL
  - Used by both client and server

### Optional (Server-Only)

These are fallback providers, in priority order:

- **`GOOGLE_MAPS_API_KEY`** (Recommended)
  - Google Maps API key with Places API enabled
  - Primary source for place photos
  - Get from [Google Cloud Console](https://console.cloud.google.com/)

- **`UNSPLASH_ACCESS_KEY`** (Optional)
  - Unsplash API access key
  - Fallback when Google photos unavailable
  - Get from [Unsplash Developers](https://unsplash.com/developers)

- **`MAPBOX_ACCESS_TOKEN`** (Optional)
  - Mapbox access token
  - Last fallback: generates static map thumbnails
  - Get from [Mapbox Account](https://account.mapbox.com/)

### Public (Client-Side)

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (REQUIRED)
  - Supabase anonymous key
  - Used for client-side database access

## Supabase Storage Setup

### Manual Bucket Creation

If automatic bucket creation fails (due to permissions), create it manually:

1. **Go to Supabase Dashboard**
   - Navigate to: Storage > Buckets

2. **Create New Bucket**
   - Click "New bucket"
   - Name: `place-images` (exact name required)
   - **Set to PUBLIC** (important for image URLs)
   - Click "Create bucket"

3. **Verify Bucket Settings**
   - Bucket should be listed as "Public"
   - If not public, click on bucket > Settings > Toggle "Public bucket"

### Storage Policies (Optional)

Even though the service role bypasses RLS, you can set policies for additional security:

**Public Read Policy:**
```sql
-- Allow public read access to place-images bucket
CREATE POLICY "Public read access for place-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');
```

**Service Role Upload Policy:**
```sql
-- Service role can upload (already bypasses RLS, but explicit is good)
CREATE POLICY "Service role can upload to place-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images');
```

Note: The service role key bypasses RLS, so these policies are optional but recommended for clarity.

## How It Works

### Image Caching Flow

1. **Request comes in** with place information (title, photoRef, coordinates, etc.)
2. **Provider selection** (in priority order):
   - Google Places Photo (if `photoRef` provided)
   - Unsplash search (if Google fails)
   - Mapbox static map (if coordinates available)
   - Returns `null` if all fail (no placeholder)
3. **Deterministic file path**: `place-images/{provider}/{sha1(placeId|title|lat|lng)}.jpg`
   - Same place = same path (prevents duplicates)
   - Always stored as `.jpg` extension
4. **Upload to Supabase Storage** using service role client
5. **Return public URL** from Supabase Storage

### File Path Format

```
place-images/{provider}/{hash}.jpg
```

Where:
- `provider` = `google`, `unsplash`, `mapbox`, or `placeholder`
- `hash` = SHA1 hash of `{placeId}|{title}|{lat}|{lng}` (first 16 chars)

Example:
```
place-images/google/a1b2c3d4e5f6g7h8.jpg
```

## Testing

### Health Check Endpoint

Check system health:

```bash
GET /api/debug/image-cache-health
```

Returns:
```json
{
  "hasSupabaseUrl": true,
  "hasServiceRoleKey": true,
  "hasGoogleKey": true,
  "hasUnsplashKey": false,
  "hasMapboxToken": false,
  "canListBuckets": true,
  "canAccessPlaceImagesBucket": true,
  "bucketError": null,
  "healthy": true,
  "recommendations": []
}
```

### Cache Image Endpoint

Cache an image for a place:

```bash
POST /api/images/cache-place-image
Content-Type: application/json

{
  "tripId": "uuid",
  "placeId": "ChIJ...",
  "title": "Eiffel Tower",
  "city": "Paris",
  "country": "France",
  "photoRef": "AZ...",
  "lat": 48.8584,
  "lng": 2.2945
}
```

**Development Response:**
```json
{
  "providerUsed": "google",
  "uploadOk": true,
  "publicUrl": "https://...supabase.co/storage/v1/object/public/place-images/google/...jpg",
  "error": null,
  "image_url": "https://...supabase.co/storage/v1/object/public/place-images/google/...jpg"
}
```

**Production Response:**
```json
{
  "publicUrl": "https://...supabase.co/storage/v1/object/public/place-images/google/...jpg",
  "providerUsed": "google",
  "image_url": "https://...supabase.co/storage/v1/object/public/place-images/google/...jpg"
}
```

### Verify in Supabase

1. Go to Storage > place-images bucket
2. Check that files are uploaded in `{provider}/` folders
3. Click on a file to verify it's accessible
4. Copy the public URL and test in browser

### Verify in Database

Check that `image_url` fields contain Supabase Storage URLs:

```sql
-- Check activities with cached images
SELECT name, image_url 
FROM activities 
WHERE image_url IS NOT NULL 
LIMIT 10;
```

URLs should look like:
```
https://{project}.supabase.co/storage/v1/object/public/place-images/{provider}/{hash}.jpg
```

## Troubleshooting

### Upload Fails with "Bucket not found"

**Error:** `Bucket "place-images" not found`

**Solution:**
1. Go to Supabase Dashboard > Storage > Buckets
2. Create bucket named `place-images`
3. Set it to PUBLIC
4. Retry the upload

### Upload Fails with "Unauthorized"

**Error:** `Unauthorized` or `RLS policy violation`

**Solution:**
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify the key is from Settings > API > `service_role` key (not `anon`)
3. Restart your server after adding the env var

### Images Not Loading in Browser

**Symptoms:** Images return 404 or don't display

**Solutions:**
1. Verify bucket is set to PUBLIC in Supabase dashboard
2. Check that `image_url` contains full Supabase Storage URL (not proxy URL)
3. Verify URL format: `https://{project}.supabase.co/storage/v1/object/public/place-images/...`
4. Test URL directly in browser

### All Providers Fail

**Symptoms:** `providerUsed: null`, `uploadOk: false`

**Possible Causes:**
1. Missing API keys (check health endpoint)
2. API rate limits exceeded
3. Invalid photo reference
4. Network issues

**Solutions:**
1. Check health endpoint for missing keys
2. Verify API keys are valid and have correct permissions
3. Check server logs for specific provider errors
4. Wait and retry if rate limited

## Production Checklist

Before deploying to production:

- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables
- [ ] Add `GOOGLE_MAPS_API_KEY` to Vercel (recommended)
- [ ] Add `UNSPLASH_ACCESS_KEY` to Vercel (optional)
- [ ] Add `MAPBOX_ACCESS_TOKEN` to Vercel (optional)
- [ ] Create `place-images` bucket in Supabase (if not auto-created)
- [ ] Set bucket to PUBLIC
- [ ] Test health endpoint: `GET /api/debug/image-cache-health`
- [ ] Test image caching: `POST /api/images/cache-place-image`
- [ ] Verify images load in browser
- [ ] Check server logs for any warnings

## Architecture Notes

### Why Service Role Client?

- **RLS Bypass**: Storage RLS policies can block uploads. Service role bypasses RLS.
- **Consistency**: Same permissions in dev and prod
- **Bucket Management**: Can create/check buckets programmatically

### Why Deterministic Paths?

- **Deduplication**: Same place = same file (no duplicates)
- **Cache Efficiency**: Browser/CDN can cache by URL
- **Predictability**: Easy to debug and verify

### Why Always JPEG?

- **Consistency**: All images stored in same format
- **Compatibility**: JPEG works everywhere
- **Size**: Generally smaller than PNG for photos

Note: Currently, PNG/WebP images are stored with `.jpg` extension but original format. Future: add image conversion library (sharp) to convert all to JPEG.

## Related Files

- `lib/supabase/admin.ts` - Service role client
- `lib/images/cache-place-image.ts` - Main caching logic
- `app/api/images/cache-place-image/route.ts` - API endpoint
- `app/api/debug/image-cache-health/route.ts` - Health check
- `lib/placePhotos.ts` - Photo resolution (prioritizes cached URLs)

