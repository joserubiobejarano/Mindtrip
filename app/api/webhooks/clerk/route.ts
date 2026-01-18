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
import { clerkClient } from '@clerk/nextjs/server';
import { normalizeEmailLanguage } from '@/lib/email/language';

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
    image_url: string | null;
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
      const avatarUrl = evt.data.image_url || null;

      console.log(`[Clerk Webhook] Processing user.created for clerk_user_id: ${clerkUserId}`);

      if (!primaryEmail) {
        console.warn(
          `[Clerk Webhook] User ${clerkUserId} created but no email address found. Skipping welcome email.`
        );
        return NextResponse.json({ ok: true, sent: false }, { status: 200 });
      }

      // Three-step profile resolution strategy
      type ProfileQueryResult = {
        id: string;
        welcome_email_sent_at: string | null;
        full_name: string | null;
        avatar_url: string | null;
      }

      let profile: ProfileQueryResult | null = null;
      let resolutionPath: 'found_by_clerk_user_id' | 'claimed_by_email' | 'created_new' = 'found_by_clerk_user_id';

      // Step 1: Try to find profile by clerk_user_id
      const { data: profileByClerkId, error: profileByClerkIdError } = await supabase
        .from('profiles')
        .select('id, welcome_email_sent_at, full_name, avatar_url')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (profileByClerkIdError) {
        console.error('[Clerk Webhook] Error fetching profile by clerk_user_id:', {
          message: profileByClerkIdError.message,
          code: profileByClerkIdError.code,
          details: profileByClerkIdError.details,
          hint: profileByClerkIdError.hint,
        });
        return NextResponse.json(
          { error: 'Failed to fetch profile' },
          { status: 500 }
        );
      }

      if (profileByClerkId) {
        profile = profileByClerkId;
        resolutionPath = 'found_by_clerk_user_id';
      } else {
        // Step 2: Try to find legacy profile by email where clerk_user_id IS NULL
        const { data: profileByEmailData, error: profileByEmailError } = await supabase
          .from('profiles')
          .select('id, welcome_email_sent_at, full_name, avatar_url')
          .eq('email', primaryEmail)
          .is('clerk_user_id', null)
          .maybeSingle();
        
        const profileByEmail = profileByEmailData as ProfileQueryResult | null;

        if (profileByEmailError) {
          console.error('[Clerk Webhook] Error fetching profile by email:', {
            message: profileByEmailError.message,
            code: profileByEmailError.code,
            details: profileByEmailError.details,
            hint: profileByEmailError.hint,
          });
          return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
          );
        }

        if (profileByEmail) {
          // Claim the legacy profile
          const updateData: {
            clerk_user_id: string;
            full_name?: string | null;
            avatar_url?: string | null;
          } = {
            clerk_user_id: clerkUserId,
          };

          // Only update full_name and avatar_url if they are currently NULL/empty
          if (!profileByEmail.full_name && fullName) {
            updateData.full_name = fullName;
          }
          if (!profileByEmail.avatar_url && avatarUrl) {
            updateData.avatar_url = avatarUrl;
          }

          const { error: updateError } = await supabase
            .from('profiles')
            // @ts-ignore - Supabase type inference issue
            .update(updateData)
            .eq('id', profileByEmail.id);

          if (updateError) {
            console.error('[Clerk Webhook] Error claiming profile:', {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
              hint: updateError.hint,
            });
            return NextResponse.json(
              { error: 'Failed to claim profile' },
              { status: 500 }
            );
          }

          profile = {
            ...profileByEmail,
            ...updateData,
          };
          resolutionPath = 'claimed_by_email';
        } else {
          // Step 3: Create new profile
          const newProfileId = randomUUID();
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            // @ts-ignore - Supabase type inference issue
            .insert({
              id: newProfileId,
              clerk_user_id: clerkUserId,
              email: primaryEmail,
              full_name: fullName,
              avatar_url: avatarUrl,
              is_pro: false,
            })
            .select('id, welcome_email_sent_at, full_name, avatar_url')
            .single();

          if (createError) {
            console.error('[Clerk Webhook] Error creating profile:', {
              message: createError.message,
              code: createError.code,
              details: createError.details,
              hint: createError.hint,
            });
            return NextResponse.json(
              { error: 'Failed to create profile' },
              { status: 500 }
            );
          }

          profile = newProfile;
          resolutionPath = 'created_new';
        }
      }

      // Log the resolution path taken
      console.log(`[Clerk Webhook] Profile resolution: ${resolutionPath} for clerk_user_id: ${clerkUserId}, profile_id: ${profile.id}`);

      // Idempotency check: if email was already sent, skip
      if (profile.welcome_email_sent_at) {
        console.log(
          `[Clerk Webhook] Welcome email already sent for clerk_user_id ${clerkUserId} at ${profile.welcome_email_sent_at}. Skipping.`
        );
        return NextResponse.json({ ok: true, sent: false }, { status: 200 });
      }

      // Send welcome email
      try {
        let language: 'en' | 'es' = 'en';
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(clerkUserId);
          language = normalizeEmailLanguage(
            (user.publicMetadata as { locale?: string } | undefined)?.locale || null
          );
        } catch (languageError: any) {
          console.warn('[Clerk Webhook] Failed to resolve language preference from Clerk:', {
            message: languageError.message,
          });
        }

        console.log(`[Clerk Webhook] Sending welcome email to ${primaryEmail} for clerk_user_id: ${clerkUserId}`);
        await sendWelcomeEmail({
          to: primaryEmail,
          firstName: firstName || null,
          language,
        });

        const now = new Date().toISOString();

        // Update profile with welcome_email_sent_at
        const { error: updateError } = await supabase
          .from('profiles')
          // @ts-ignore - Supabase type inference issue
          .update({ welcome_email_sent_at: now })
          .eq('id', profile.id);

        if (updateError) {
          console.error('[Clerk Webhook] Error updating welcome_email_sent_at:', {
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
