import { z } from 'zod';

// Common schemas
export const UUIDSchema = z.string().uuid('Invalid UUID format');
export const TripIdSchema = UUIDSchema;
export const DayIdSchema = UUIDSchema;
export const ActivityIdSchema = UUIDSchema;
export const SegmentIdSchema = UUIDSchema;
export const PlaceIdSchema = z.string().min(1, 'Place ID is required');

// Trip params
export const TripIdParamsSchema = z.object({
  tripId: TripIdSchema,
});

export const TripIdActivityIdParamsSchema = z.object({
  tripId: TripIdSchema,
  activityId: ActivityIdSchema,
});

export const TripIdDayIdParamsSchema = z.object({
  tripId: TripIdSchema,
  dayId: DayIdSchema,
});

export const TripIdSegmentIdParamsSchema = z.object({
  tripId: TripIdSchema,
  segmentId: SegmentIdSchema,
});

// Trip segments
export const CreateSegmentSchema = z.object({
  cityPlaceId: z.string().min(1, 'City place ID is required'),
  cityName: z.string().min(1, 'City name is required'),
  nights: z.number().int().positive('Nights must be a positive integer'),
  transportType: z.enum(['flight', 'train', 'bus', 'car', 'other']).optional(),
  notes: z.string().optional(),
}).strict();

export const UpdateSegmentSchema = z.object({
  cityPlaceId: z.string().min(1).optional(),
  cityName: z.string().min(1).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  transportType: z.enum(['flight', 'train', 'bus', 'car', 'other']).optional(),
  notes: z.string().optional(),
}).strict();

// Explore swipe
export const SwipeActionSchema = z.enum(['like', 'dislike', 'undo']);
export const SwipeSourceSchema = z.enum(['trip', 'day']).optional();

export const SwipeRequestSchema = z.object({
  place_id: PlaceIdSchema,
  action: SwipeActionSchema,
  previous_action: SwipeActionSchema.optional(),
  source: SwipeSourceSchema,
  trip_segment_id: UUIDSchema.optional().nullable(),
  day_id: DayIdSchema.optional(),
  slot: z.string().optional(),
}).strict().refine(
  (data) => {
    // For undo, require previous_action
    if (data.action === 'undo') {
      return !!data.previous_action && (data.previous_action === 'like' || data.previous_action === 'dislike');
    }
    return true;
  },
  { message: 'previous_action is required for undo' }
).refine(
  (data) => {
    // For day-level swipes, require day_id
    if (data.source === 'day') {
      return !!data.day_id;
    }
    return true;
  },
  { message: 'day_id is required for day-level swipes' }
);

// Assistant/chat
export const AssistantMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  activeSegmentId: UUIDSchema.optional(),
  activeDayId: DayIdSchema.optional(),
  language: z.enum(['en', 'es']).optional(),
}).strict();

// Itinerary generation
export const ItineraryRequestSchema = z.object({
  tripId: TripIdSchema,
  trip_segment_id: UUIDSchema.optional().nullable(),
}).strict();

// Plan day
export const PlanDayRequestSchema = z.object({
  tripId: TripIdSchema,
  dayId: DayIdSchema,
}).strict();

// Activity replace
export const ReplaceActivityRequestSchema = z.object({
  place_id: PlaceIdSchema.optional(),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  notes: z.string().max(5000, 'Notes too long').optional(),
  filters: z.object({
    price_level: z.number().int().min(0).max(4).optional(),
    rating: z.number().min(0).max(5).optional(),
    open_now: z.boolean().optional(),
    types: z.array(z.string()).optional(),
  }).optional(),
}).strict();

// Places autocomplete
export const AutocompleteQuerySchema = z.object({
  input: z.string().min(2, 'Input must be at least 2 characters').max(100, 'Input too long'),
  types: z.string().optional(),
  location: z.string().optional(), // lat,lng format
}).strict();

// Bulk add activities
export const BulkAddActivitiesRequestSchema = z.object({
  place_ids: z.array(PlaceIdSchema).min(1, 'At least one place ID is required').max(50, 'Too many places'),
  day_id: DayIdSchema,
}).strict();

// Distribute liked places
export const DistributeLikedPlacesRequestSchema = z.object({
  place_ids: z.array(PlaceIdSchema).min(1, 'At least one place ID is required'),
  trip_segment_id: UUIDSchema.optional().nullable(),
}).strict();

// Explore places
export const ExplorePlacesQuerySchema = z.object({
  tripId: TripIdSchema,
  trip_segment_id: UUIDSchema.optional().nullable(),
  filters: z.object({
    price_level: z.number().int().min(0).max(4).optional(),
    rating: z.number().min(0).max(5).optional(),
    open_now: z.boolean().optional(),
    types: z.array(z.string()).optional(),
  }).optional(),
}).strict();

// Chat messages
export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
}).strict();

// Itinerary chat
export const ItineraryChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  trip_segment_id: UUIDSchema.optional().nullable(),
}).strict();
