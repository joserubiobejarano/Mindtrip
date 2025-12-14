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
  try {
    // Get Svix headers for signature verification
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
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
      console.error('Clerk webhook signature verification error:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Handle user.created event
    if (evt.type === 'user.created') {
      const userId = evt.data.id;
      const emailAddresses = evt.data.email_addresses || [];
      const primaryEmail = emailAddresses[0]?.email_address;
      const firstName = evt.data.first_name || '';

      if (!primaryEmail) {
        console.warn(
          `User ${userId} created but no email address found. Skipping welcome email.`
        );
        return NextResponse.json({ ok: true, sent: false });
      }

      // Check if profile exists and if email was already sent
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, welcome_email_sent_at')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
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
          `Welcome email already sent for user ${userId} at ${profile.welcome_email_sent_at}`
        );
        return NextResponse.json({ ok: true, sent: false });
      }

      // Send welcome email
      try {
        await sendWelcomeEmail({
          to: primaryEmail,
          firstName: firstName || null,
        });

        const now = new Date().toISOString();

        // Update or create profile with welcome_email_sent_at
        if (profile) {
          // Profile exists, update it
          const { error: updateError } = await (supabase
            .from('profiles') as any)
            .update({ welcome_email_sent_at: now })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating profile:', updateError);
            // Email was sent but update failed - log for manual check
            return NextResponse.json(
              { error: 'Email sent but failed to update profile' },
              { status: 500 }
            );
          }
        } else {
          // Profile doesn't exist, create it
          const { error: insertError } = await (supabase.from('profiles') as any).insert({
            id: userId,
            email: primaryEmail,
            full_name: firstName || null,
            welcome_email_sent_at: now,
          });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // Email was sent but insert failed - log for manual check
            return NextResponse.json(
              { error: 'Email sent but failed to create profile' },
              { status: 500 }
            );
          }
        }

        console.log(`Welcome email sent to ${primaryEmail} for user ${userId}`);
        return NextResponse.json({ ok: true, sent: true });
      } catch (emailError: any) {
        console.error('Error sending welcome email:', emailError);
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: 500 }
        );
      }
    }

    // Unhandled event type - return success to avoid retries
    console.log(`Unhandled event type: ${evt.type}`);
    return NextResponse.json({ ok: true, sent: false });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
