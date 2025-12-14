import { Resend } from 'resend';

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
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? 'no-reply@kruno.app';
  const appUrl = process.env.APP_URL ?? 'https://kruno.app';

  const subject = 'Welcome to Kruno ✈️';
  const greeting = `Hey ${params.firstName || 'there'},`;
  const body = `${greeting}

Welcome to Kruno! We're excited to help you plan your next adventure with less stress, fewer decisions, and more confidence.

With Kruno, you can focus on what matters most: enjoying your trip. We handle the planning, so you can experience the journey.

Get started by creating your first itinerary at:
${appUrl}

Happy travels!

Jose
Founder, Kruno`;

  return resend.emails.send({
    from,
    to: params.to,
    subject,
    text: body,
    reply_to: "hello@kruno.app",
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@kruno.app>",
    },
  });
}
