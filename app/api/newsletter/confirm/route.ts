import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';
import { sendNewsletterWelcomeEmail } from '@/lib/email/resend';
import { upsertResendContact } from '@/lib/email/audience';

type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getAppUrl() {
  return process.env.APP_URL || 'https://www.kruno.app';
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const appUrl = getAppUrl();

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=invalid', appUrl));
  }

  const supabase = createSupabaseAdmin() as any;
  const newsletterTable = supabase.from('newsletter_subscribers') as any;
  const { data: subscriber, error } = await newsletterTable
    .select('*')
    .eq('confirm_token', token)
    .maybeSingle();
  const typedSubscriber = subscriber as NewsletterSubscriber | null;

  if (error) {
    console.error('Newsletter confirm lookup failed:', error);
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=error', appUrl));
  }

  if (!typedSubscriber) {
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=invalid', appUrl));
  }

  if (typedSubscriber.status === 'subscribed') {
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=already', appUrl));
  }

  const now = new Date().toISOString();
  const nextConfirmToken = generateToken();

  const { data: updated, error: updateError } = await newsletterTable
    .update({
      status: 'subscribed',
      confirmed_at: now,
      confirm_token: nextConfirmToken,
      updated_at: now,
    })
    .eq('id', typedSubscriber.id)
    .select('*')
    .single();

  if (updateError || !updated) {
    console.error('Newsletter confirm update failed:', updateError);
    return NextResponse.redirect(new URL('/newsletter/confirmed?status=error', appUrl));
  }

  const audienceId =
    updated.language === 'es'
      ? process.env.RESEND_AUDIENCE_ID_ES
      : process.env.RESEND_AUDIENCE_ID_EN;

  const providerContactId = await upsertResendContact({
    audienceId,
    email: updated.email,
    firstName: updated.name,
    language: updated.language,
    externalId: updated.id,
    providerContactId: updated.provider_contact_id,
  });

  if (providerContactId && providerContactId !== updated.provider_contact_id) {
    const { error: providerError } = await newsletterTable
      .update({
        provider_contact_id: providerContactId,
        provider: 'resend',
        updated_at: now,
      })
      .eq('id', updated.id);

    if (providerError) {
      console.warn('Newsletter provider contact update failed:', providerError);
    }
  }

  const manageUrl = `${appUrl}/api/newsletter/unsubscribe?token=${updated.manage_token}`;

  try {
    await sendNewsletterWelcomeEmail({
      email: updated.email,
      name: updated.name,
      language: updated.language,
      manageUrl,
    });
  } catch (error) {
    console.warn('Newsletter welcome email failed:', error);
  }

  return NextResponse.redirect(new URL('/newsletter/confirmed', appUrl));
}
