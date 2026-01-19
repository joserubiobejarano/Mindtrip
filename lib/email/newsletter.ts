import type { Database } from '@/types/database';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { upsertResendContact } from '@/lib/email/audience';
import { sendNewsletterWelcomeEmail } from '@/lib/email/resend';
import type { EmailLanguage } from '@/lib/email-copy';

type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];

export async function syncNewsletterSubscriber(params: {
  subscriber: NewsletterSubscriber;
  appUrl: string;
}) {
  const { subscriber, appUrl } = params;
  const now = new Date().toISOString();
  const emailLanguage: EmailLanguage | undefined =
    subscriber.language === 'en' || subscriber.language === 'es'
      ? subscriber.language
      : undefined;
  const audienceId =
    subscriber.language === 'es'
      ? process.env.RESEND_AUDIENCE_ID_ES
      : process.env.RESEND_AUDIENCE_ID_EN;

  const providerContactId = await upsertResendContact({
    audienceId,
    email: subscriber.email,
    firstName: subscriber.name,
    language: emailLanguage,
    externalId: subscriber.id,
    providerContactId: subscriber.provider_contact_id,
  });

  if (providerContactId && providerContactId !== subscriber.provider_contact_id) {
    const supabase = createSupabaseAdmin() as any;
    const { error: providerError } = await supabase
      .from('newsletter_subscribers')
      .update({
        provider_contact_id: providerContactId,
        provider: 'resend',
        updated_at: now,
      })
      .eq('id', subscriber.id);

    if (providerError) {
      console.warn('Newsletter provider contact update failed:', providerError);
    }
  }

  const manageUrl = `${appUrl}/api/newsletter/unsubscribe?token=${subscriber.manage_token}`;

  try {
    await sendNewsletterWelcomeEmail({
      email: subscriber.email,
      name: subscriber.name,
      language: emailLanguage,
      manageUrl,
    });
  } catch (error) {
    console.warn('Newsletter welcome email failed:', error);
  }
}
