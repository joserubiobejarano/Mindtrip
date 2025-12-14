/**
 * Clerk Webhook Handler
 * 
 * Clerk Dashboard Setup:
 * 1. Webhook endpoint URL: https://<our-domain>/api/webhooks/clerk
 * 2. Subscribe to event: user.created
 * 3. Copy the signing secret from Clerk dashboard
 * 4. Set it in environment variables as CLERK_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { randomUUID } from 'crypto';

// Disable body parsing for webhook - we need raw body for signature verification
export const runtime = 'nodejs';

// Next.js 15: disable body parsing to get raw body
export const dynamic = 'force-dynamic';

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
  };
  object: string;
}

export async function POST(req: NextRequest) {
  // Log request received
  const path = req.nextUrl.pathname;
  const headerKeys = Array.from(req.headers.keys());
  console.log(`[Clerk Webhook] Request received: ${path}, Headers: ${headerKeys.join(', ')}`);

  try {
    // Get Svix headers for signature verification
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[Clerk Webhook] Missing svix headers - required: svix-id, svix-timestamp, svix-signature');
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error('[Clerk Webhook] CLERK_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Read raw body (needed for signature verification)
    const body = await req.text();

    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt: ClerkWebhookPayload;

    try {
      // Svix.verify() returns the parsed payload
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookPayload;
    } catch (err: any) {
      console.error('[Clerk Webhook] Signature verification failed:', {
        message: err.message,
        stack: err.stack,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log event type
    console.log(`[Clerk Webhook] Event type: ${evt.type}`);

    const supabase = await createClient();

    // Handle user.created event
    if (evt.type === 'user.created') {
      const clerkUserId = evt.data.id;
      const emailAddresses = evt.data.email_addresses || [];
      const primaryEmail = emailAddresses[0]?.email_address;
      const firstName = evt.data.first_name || '';
      const lastName = evt.data.last_name || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

      console.log(`[Clerk Webhook] Processing user.created for clerk_user_id: ${clerkUserId}`);

      if (!primaryEmail) {
        console.warn(
          `[Clerk Webhook] User ${clerkUserId} created but no email address found. Skipping welcome email.`
        );
        return NextResponse.json({ ok: true, sent: false }, { status: 200 });
      }

      // Check if profile exists and if email was already sent (using clerk_user_id)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, welcome_email_sent_at')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (profileError) {
        console.error('[Clerk Webhook] Error fetching profile:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });
        return NextResponse.json(
          { error: 'Failed to fetch profile' },
          { status: 500 }
        );
      }

      type ProfileQueryResult = {
        id: string
        welcome_email_sent_at: string | null
      }

      const profile = profileData as ProfileQueryResult | null;

      // Idempotency check: if email was already sent, skip
      if (profile?.welcome_email_sent_at) {
        console.log(
          `[Clerk Webhook] Welcome email already sent for clerk_user_id ${clerkUserId} at ${profile.welcome_email_sent_at}. Skipping.`
        );
        return NextResponse.json({ ok: true, sent: false }, { status: 200 });
      }

      // Send welcome email
      try {
        console.log(`[Clerk Webhook] Sending welcome email to ${primaryEmail} for clerk_user_id: ${clerkUserId}`);
        await sendWelcomeEmail({
          to: primaryEmail,
          firstName: firstName || null,
        });

        const now = new Date().toISOString();

        // Update or create profile with clerk_user_id and welcome_email_sent_at
        if (profile) {
          // Profile exists, update it with clerk_user_id and welcome_email_sent_at
          const { error: updateError } = await (supabase
            .from('profiles') as any)
            .update({ 
              clerk_user_id: clerkUserId,
              welcome_email_sent_at: now,
            })
            .eq('id', profile.id);

          if (updateError) {
            console.error('[Clerk Webhook] Error updating profile:', {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
              hint: updateError.hint,
              stack: updateError.stack,
            });
            // Email was sent but update failed - log for manual check
            return NextResponse.json(
              { error: 'Email sent but failed to update profile' },
              { status: 500 }
            );
          }
        } else {
          // Profile doesn't exist, create it with clerk_user_id
          // Generate a UUID for the profile id (since profiles.id is still the primary key)
          const profileId = randomUUID();
          
          const { error: insertError } = await (supabase.from('profiles') as any).insert({
            id: profileId,
            clerk_user_id: clerkUserId,
            email: primaryEmail,
            full_name: fullName,
            is_pro: false,
            welcome_email_sent_at: now,
          });

          if (insertError) {
            console.error('[Clerk Webhook] Error creating profile:', {
              message: insertError.message,
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint,
              stack: insertError.stack,
            });
            // Email was sent but insert failed - log for manual check
            return NextResponse.json(
              { error: 'Email sent but failed to create profile' },
              { status: 500 }
            );
          }
        }

        console.log(`[Clerk Webhook] Welcome email sent successfully to ${primaryEmail} for clerk_user_id: ${clerkUserId}`);
        return NextResponse.json({ ok: true, sent: true }, { status: 200 });
      } catch (emailError: any) {
        console.error('[Clerk Webhook] Error sending welcome email:', {
          message: emailError.message,
          stack: emailError.stack,
        });
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: 500 }
        );
      }
    }

    // Unhandled event type - return success to avoid retries
    console.log(`[Clerk Webhook] Unhandled event type: ${evt.type}`);
    return NextResponse.json({ ok: true, sent: false }, { status: 200 });
  } catch (err: any) {
    console.error('[Clerk Webhook] Unexpected error:', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: err.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
