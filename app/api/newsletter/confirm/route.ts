import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';
import { syncNewsletterSubscriber } from '@/lib/email/newsletter';

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

  await syncNewsletterSubscriber({ subscriber: updated, appUrl });

  return NextResponse.redirect(new URL('/newsletter/confirmed', appUrl));
}
