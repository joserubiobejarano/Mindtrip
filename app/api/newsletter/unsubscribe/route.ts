import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { removeResendContact } from '@/lib/email/audience';
import { sendNewsletterUnsubscribedEmail } from '@/lib/email/resend';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getAppUrl() {
  return process.env.APP_URL || 'https://www.kruno.app';
}

async function markUnsubscribedById(subscriberId: string) {
  const supabase = createSupabaseAdmin() as any;
  const now = new Date().toISOString();
  const nextConfirmToken = generateToken();

  const { data: updated, error } = await supabase
    .from('newsletter_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: now,
      confirm_token: nextConfirmToken,
      updated_at: now,
    })
    .eq('id', subscriberId)
    .select('*')
    .single();

  if (error || !updated) {
    console.error('Newsletter unsubscribe update failed:', error);
    return null;
  }

  const audienceId =
    updated.language === 'es'
      ? process.env.RESEND_AUDIENCE_ID_ES
      : process.env.RESEND_AUDIENCE_ID_EN;

  if (updated.provider_contact_id) {
    await removeResendContact({
      contactId: updated.provider_contact_id,
      audienceId,
    });
  }

  try {
    await sendNewsletterUnsubscribedEmail({
      email: updated.email,
      name: updated.name,
      language: updated.language,
    });
  } catch (error) {
    console.warn('Newsletter unsubscribed email failed:', error);
  }

  return updated;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const appUrl = getAppUrl();

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?status=invalid', appUrl));
  }

  const supabase = createSupabaseAdmin() as any;
  const { data: subscriber, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('manage_token', token)
    .maybeSingle();

  if (error) {
    console.error('Newsletter unsubscribe lookup failed:', error);
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?status=error', appUrl));
  }

  if (!subscriber) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?status=invalid', appUrl));
  }

  if (subscriber.status !== 'unsubscribed') {
    await markUnsubscribedById(subscriber.id);
  }

  return NextResponse.redirect(new URL('/newsletter/unsubscribed', appUrl));
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const primaryEmail = user?.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });
    }

    const body = await request.json();
    const emailInput = typeof body?.email === 'string' ? body.email : '';
    const email = normalizeEmail(emailInput);

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    if (normalizeEmail(primaryEmail) !== email) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createSupabaseAdmin() as any;
    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error) {
      console.error('Newsletter unsubscribe lookup failed:', error);
      return NextResponse.json({ ok: false, error: 'Lookup failed' }, { status: 500 });
    }

    if (!subscriber) {
      return NextResponse.json({ ok: true, status: 'unsubscribed' });
    }

    if (subscriber.status !== 'unsubscribed') {
      await markUnsubscribedById(subscriber.id);
    }

    return NextResponse.json({ ok: true, status: 'unsubscribed' });
  } catch (error) {
    console.error('POST /api/newsletter/unsubscribe error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
