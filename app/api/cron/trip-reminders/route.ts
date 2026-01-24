import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { clerkClient } from '@clerk/nextjs/server';
import { sendTripReminderEmail } from '@/lib/email/resend';
import { getFirstNameFromFullName, normalizeEmailLanguage } from '@/lib/email/language';

type TripRow = {
  id: string;
  title: string;
  start_date: string;
  destination_city: string | null;
  destination_name: string | null;
  owner_id: string;
  trip_reminder_email_sent_at: string | null;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  clerk_user_id: string | null;
};

async function resolveRecipient(profile: ProfileRow) {
  if (profile.clerk_user_id) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(profile.clerk_user_id);
      return {
        email: user.primaryEmailAddress?.emailAddress || profile.email,
        firstName: user.firstName || getFirstNameFromFullName(user.fullName) || getFirstNameFromFullName(profile.full_name),
        language: normalizeEmailLanguage(
          (user.publicMetadata as { locale?: string } | undefined)?.locale || null
        ),
      };
    } catch (error) {
      console.warn('[trip-reminders] Failed to load Clerk user for email details:', error);
    }
  }

  return {
    email: profile.email,
    firstName: getFirstNameFromFullName(profile.full_name),
    language: 'en' as const,
  };
}

function getTomorrowDateString(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const providedSecret = req.headers.get('x-cron-secret');

  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const targetDate = getTomorrowDateString();

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id, title, start_date, destination_city, destination_name, owner_id, trip_reminder_email_sent_at')
    .eq('start_date', targetDate)
    .is('trip_reminder_email_sent_at', null);

  if (tripsError) {
    console.error('[trip-reminders] Error fetching trips:', tripsError);
    return NextResponse.json({ error: 'Failed to load trips' }, { status: 500 });
  }

  const tripRows = (trips || []) as TripRow[];
  if (tripRows.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const tripIds = tripRows.map(trip => trip.id);
  const { data: itineraryRows, error: itineraryError } = await supabase
    .from('smart_itineraries')
    .select('trip_id')
    .in('trip_id', tripIds)
    .returns<Array<{ trip_id: string }>>();

  if (itineraryError) {
    console.error('[trip-reminders] Error checking smart itineraries:', itineraryError);
    return NextResponse.json({ error: 'Failed to load itineraries' }, { status: 500 });
  }

  const tripIdsWithItinerary = new Set(
    (itineraryRows || []).map(row => row.trip_id)
  );

  const tripsToNotify = tripRows.filter(trip => tripIdsWithItinerary.has(trip.id));
  if (tripsToNotify.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const ownerIds = Array.from(new Set(tripsToNotify.map(trip => trip.owner_id)));
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, clerk_user_id')
    .in('id', ownerIds)
    .returns<ProfileRow[]>();

  if (profilesError) {
    console.error('[trip-reminders] Error fetching profiles:', profilesError);
    return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 });
  }

  const profilesById = new Map((profiles || []).map(profile => [profile.id, profile]));
  const appUrl = process.env.APP_URL || 'https://kruno.app';

  // Get or create public share links for all trips
  const { createSupabaseAdmin } = await import('@/lib/supabase/admin');
  const adminSupabase = createSupabaseAdmin();
  
  // Fetch existing shares for all trips
  const tripIds = tripsToNotify.map(t => t.id);
  const { data: existingShares } = await adminSupabase
    .from('trip_shares')
    .select('trip_id, public_slug')
    .in('trip_id', tripIds);

  const sharesByTripId = new Map(
    (existingShares || []).map(share => [share.trip_id, share.public_slug])
  );

  // Generate slug helper
  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  };

  // Create shares for trips that don't have one
  const sharesToCreate = tripsToNotify
    .filter(trip => !sharesByTripId.has(trip.id))
    .map(trip => ({
      trip_id: trip.id,
      public_slug: generateSlug(),
    }));

  if (sharesToCreate.length > 0) {
    const { data: newShares, error: createError } = await adminSupabase
      .from('trip_shares')
      .insert(sharesToCreate)
      .select('trip_id, public_slug');

    if (createError) {
      console.error('[trip-reminders] Failed to create share links:', createError);
    } else {
      // Add new shares to the map
      (newShares || []).forEach(share => {
        sharesByTripId.set(share.trip_id, share.public_slug);
      });
    }
  }

  let sentCount = 0;

  for (const trip of tripsToNotify) {
    const profile = profilesById.get(trip.owner_id);
    if (!profile) {
      console.warn(`[trip-reminders] Missing profile for owner ${trip.owner_id}`);
      continue;
    }

    const recipient = await resolveRecipient(profile);
    if (!recipient.email) {
      console.warn(`[trip-reminders] Missing email for owner ${trip.owner_id}`);
      continue;
    }

    const tripCity = trip.destination_city || trip.destination_name || trip.title;
    
    // Use public share link if available, fallback to authenticated URL
    const publicSlug = sharesByTripId.get(trip.id);
    const tripUrl = publicSlug 
      ? `${appUrl}/p/${publicSlug}`
      : `${appUrl}/trips/${trip.id}`;

    try {
      await sendTripReminderEmail({
        userEmail: recipient.email,
        firstName: recipient.firstName,
        tripCity,
        tripStartDate: trip.start_date,
        tripUrl,
        language: recipient.language,
      });

      // Type assertion needed because Supabase type inference can fail for update calls
      const { error: updateError } = await (supabase
        .from('trips') as any)
        .update({ trip_reminder_email_sent_at: new Date().toISOString() })
        .eq('id', trip.id);

      if (updateError) {
        console.error('[trip-reminders] Failed to update trip_reminder_email_sent_at:', updateError);
        continue;
      }

      sentCount += 1;
    } catch (error) {
      console.error('[trip-reminders] Failed to send reminder email:', error);
    }
  }

  return NextResponse.json({ ok: true, sent: sentCount });
}
