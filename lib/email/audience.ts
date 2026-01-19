import { getResendClient } from './resend';

type UpsertResendContactParams = {
  audienceId?: string | null;
  email: string;
  firstName?: string | null;
  language?: string;
  externalId?: string | null;
  providerContactId?: string | null;
};

export async function upsertResendContact(params: UpsertResendContactParams) {
  if (!params.audienceId) {
    return null;
  }

  try {
    const resend = getResendClient();

    if (params.providerContactId) {
      const updated = await resend.contacts.update({
        audienceId: params.audienceId,
        id: params.providerContactId,
        email: params.email,
        firstName: params.firstName || undefined,
        lastName: undefined,
        unsubscribed: false,
      });

      return updated.data?.id ?? params.providerContactId;
    }

    const created = await resend.contacts.create({
      audienceId: params.audienceId,
      email: params.email,
      firstName: params.firstName || undefined,
      lastName: undefined,
      unsubscribed: false,
    });

    return created.data?.id ?? null;
  } catch (error) {
    console.warn('Resend audience sync failed:', error);
    return null;
  }
}

export async function removeResendContact(params: {
  contactId?: string | null;
  audienceId?: string | null;
}) {
  if (!params.contactId || !params.audienceId) {
    return false;
  }

  try {
    const resend = getResendClient();
    await resend.contacts.remove({ id: params.contactId, audienceId: params.audienceId });
    return true;
  } catch (error) {
    console.warn('Resend contact removal failed:', error);
    return false;
  }
}
