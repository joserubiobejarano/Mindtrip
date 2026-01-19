import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { sendNewsletterConfirmEmail } from '@/lib/email/resend';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONFIRM_THROTTLE_MS = 10 * 60 * 1000;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function resolveLanguage(request: Request, language?: string) {
  if (language === 'en' || language === 'es') {
    return language;
  }
  const header = request.headers.get('accept-language') || '';
  return header.toLowerCase().includes('es') ? 'es' : 'en';
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getAppUrl() {
  return process.env.APP_URL || 'https://www.kruno.app';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailInput = typeof body?.email === 'string' ? body.email : '';
    const email = normalizeEmail(emailInput);

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const source = typeof body?.source === 'string' ? body.source : 'homepage_form';
    const name = typeof body?.name === 'string' ? body.name.trim() : null;
    const language = resolveLanguage(request, body?.language);

    const supabase = createSupabaseAdmin() as any;
    const userId = request.headers.get('x-clerk-user-id')?.trim() || null;

    let profileId: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', userId)
        .maybeSingle();
      profileId = (profile?.id as string | undefined) ?? null;
    }

    const { data: existing, error: existingError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (existingError) {
      console.error('Newsletter lookup failed:', existingError);
      return NextResponse.json({ ok: false, error: 'Lookup failed' }, { status: 500 });
    }

    if (existing?.status === 'subscribed') {
      return NextResponse.json({ ok: true, status: 'subscribed' });
    }

    const now = new Date().toISOString();
    const manageToken = existing?.manage_token || generateToken();
    let confirmToken = existing?.confirm_token || generateToken();
    let shouldSend = true;

    if (existing?.status === 'pending' && existing.confirm_sent_at) {
      const sentAt = new Date(existing.confirm_sent_at).getTime();
      if (!Number.isNaN(sentAt) && Date.now() - sentAt < CONFIRM_THROTTLE_MS) {
        shouldSend = false;
      }
    }

    if (!existing || existing.status === 'unsubscribed') {
      confirmToken = generateToken();
    }

    const payload = {
      user_id: profileId ?? existing?.user_id ?? null,
      email,
      name: name || existing?.name || null,
      source: source || existing?.source || 'homepage_form',
      language,
      status: 'pending',
      confirm_token: confirmToken,
      manage_token: manageToken,
      confirm_sent_at: shouldSend ? now : existing?.confirm_sent_at ?? null,
      confirmed_at: null,
      unsubscribed_at: null,
      updated_at: now,
    };

    const { data: saved, error: saveError } = existing
      ? await supabase
          .from('newsletter_subscribers')
          .update(payload)
          .eq('id', existing.id)
          .select('*')
          .single()
      : await supabase
          .from('newsletter_subscribers')
          .insert(payload)
          .select('*')
          .single();

    if (saveError) {
      console.error('Newsletter save failed:', saveError);
      return NextResponse.json({ ok: false, error: 'Save failed' }, { status: 500 });
    }

    if (shouldSend) {
      const appUrl = getAppUrl();
      const confirmUrl = `${appUrl}/api/newsletter/confirm?token=${confirmToken}`;
      const manageUrl = `${appUrl}/api/newsletter/unsubscribe?token=${manageToken}`;

      await sendNewsletterConfirmEmail({
        email,
        name: saved?.name ?? null,
        language,
        confirmUrl,
        manageUrl,
      });
    }

    return NextResponse.json({ ok: true, status: 'pending' });
  } catch (error) {
    console.error('POST /api/newsletter/subscribe error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
