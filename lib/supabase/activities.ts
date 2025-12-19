import { createClient } from '@/lib/supabase/client'
import type { PlannedActivity } from '@/types/ai'

export async function addActivitiesForDay(
  dayId: string,
  activities: PlannedActivity[]
) {
  const supabase = createClient()

  // Get the current max order_number for this day to append new activities
  const { data: existingActivities } = await supabase
    .from('activities')
    .select('order_number')
    .eq('day_id', dayId)
    .order('order_number', { ascending: false })
    .limit(1)

  type ActivityQueryResult = {
    order_number: number | null
    [key: string]: any
  }

  const existingActivitiesTyped = (existingActivities || []) as ActivityQueryResult[];
  const maxOrder = existingActivitiesTyped?.[0]?.order_number ?? 0

  // Map PlannedActivity to activities table schema
  // Note: category is not in the activities table schema, so we'll include it in notes
  const activitiesToInsert = activities.map((activity, index) => {
    // Combine category and notes if both exist
    const notes = activity.category
      ? `Category: ${activity.category}${activity.notes ? `\n\n${activity.notes}` : ''}`
      : activity.notes || null

    // Extract image URL if available (PlannedActivity doesn't have photos, but check for any photo fields)
    let imageUrl: string | null = null;
    if ((activity as any).image_url && typeof (activity as any).image_url === 'string') {
      imageUrl = (activity as any).image_url;
    } else if ((activity as any).photoUrl && typeof (activity as any).photoUrl === 'string') {
      imageUrl = (activity as any).photoUrl;
    } else if ((activity as any).photos && Array.isArray((activity as any).photos) && (activity as any).photos.length > 0) {
      const photo = (activity as any).photos[0];
      // Check if it's a Google Maps photo object with getUrl method
      if (photo && typeof photo.getUrl === 'function') {
        try {
          imageUrl = photo.getUrl({ maxWidth: 1200 });
        } catch (err) {
          console.error("Error getting photo URL from PlannedActivity:", err);
          imageUrl = null;
        }
      } else if (typeof photo === 'string') {
        imageUrl = photo;
      }
    }

    return {
      day_id: dayId,
      title: activity.title,
      start_time: activity.start_time || null,
      end_time: activity.end_time || null,
      notes,
      order_number: maxOrder + index + 1,
      place_id: null, // AI-generated activities don't have place_id initially
      image_url: imageUrl,
    }
  })

  const { data, error } = await (supabase
    .from('activities') as any)
    .insert(activitiesToInsert)
    .select()

  if (error) {
    throw error
  }

  return data
}

