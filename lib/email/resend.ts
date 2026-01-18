import { Resend } from 'resend';
import { getEmailCopy, type EmailLanguage } from '../email-copy';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendWelcomeEmail(params: {
  to: string;
  firstName?: string | null;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const language = params.language || 'en';

  const emailCopy = getEmailCopy('welcome', language, {
    firstName: params.firstName,
    appName: 'Kruno',
  });

  return resend.emails.send({
    from,
    to: params.to,
    subject: emailCopy.subject,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}

export async function sendTripInvitationEmail(params: {
  to: string;
  tripName: string;
  inviterName: string;
  tripId: string;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://kruno.app';
  const inviteUrl = `${appUrl}/trips?invitedTripId=${params.tripId}`;
  const language = params.language || 'en';
  
  // Build deep link URL: kruno://link?invitedTripId=<tripId>&lang=<language>
  const deepLinkUrl = `kruno://link?invitedTripId=${params.tripId}${language !== 'en' ? `&lang=${language}` : ''}`;

  const emailCopy = getEmailCopy('trip_invite', language, {
    tripName: params.tripName,
    inviterName: params.inviterName,
    ctaUrl: inviteUrl,
    deepLinkUrl,
  });

  return resend.emails.send({
    from,
    to: params.to,
    subject: emailCopy.subject,
    html: emailCopy.html,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}

export async function sendExpensesSummaryEmail(params: {
  to: string;
  tripName: string;
  totalText: string;
  summaryText: string;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const language = params.language || 'en';

  const emailCopy = getEmailCopy('expenses_summary', language, {
    tripName: params.tripName,
    totalText: params.totalText,
    summaryText: params.summaryText,
  });

  return resend.emails.send({
    from,
    to: params.to,
    subject: emailCopy.subject,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}

export async function sendTripReadyEmail(params: {
  userEmail: string;
  firstName?: string | null;
  tripName: string;
  tripCity: string;
  tripUrl: string;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const language = params.language || 'en';

  const emailCopy = getEmailCopy('trip_ready', language, {
    firstName: params.firstName,
    tripName: params.tripName,
    tripCity: params.tripCity,
    tripUrl: params.tripUrl,
  });

  return resend.emails.send({
    from,
    to: params.userEmail,
    subject: emailCopy.subject,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}

export async function sendProUpgradeEmail(params: {
  userEmail: string;
  firstName?: string | null;
  billingUrl: string;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const language = params.language || 'en';

  const emailCopy = getEmailCopy('pro_upgrade', language, {
    firstName: params.firstName,
    billingUrl: params.billingUrl,
  });

  return resend.emails.send({
    from,
    to: params.userEmail,
    subject: emailCopy.subject,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}

export async function sendSubscriptionCanceledEmail(params: {
  userEmail: string;
  firstName?: string | null;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const language = params.language || 'en';

  const emailCopy = getEmailCopy('subscription_canceled', language, {
    firstName: params.firstName,
  });

  return resend.emails.send({
    from,
    to: params.userEmail,
    subject: emailCopy.subject,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}

export async function sendTripReminderEmail(params: {
  userEmail: string;
  firstName?: string | null;
  tripCity: string;
  tripStartDate: string;
  tripUrl: string;
  language?: EmailLanguage;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const language = params.language || 'en';

  const emailCopy = getEmailCopy('trip_reminder', language, {
    firstName: params.firstName,
    tripCity: params.tripCity,
    tripStartDate: params.tripStartDate,
    tripUrl: params.tripUrl,
  });

  return resend.emails.send({
    from,
    to: params.userEmail,
    subject: emailCopy.subject,
    text: emailCopy.text,
    replyTo: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}