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

    return {
      day_id: dayId,
      title: activity.title,
      start_time: activity.start_time || null,
      end_time: activity.end_time || null,
      notes,
      order_number: maxOrder + index + 1,
      place_id: null, // AI-generated activities don't have place_id initially
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

