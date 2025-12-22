import type { Language } from './i18n';

export type EmailLanguage = Language;

type WelcomeParams = {
  firstName?: string | null;
  appName?: string;
};

type TripInviteParams = {
  tripName: string;
  inviterName: string;
  ctaUrl: string;
  deepLinkUrl?: string;
};

type ExpensesSummaryParams = {
  tripName: string;
  totalText: string;
  summaryText: string;
};

type EmailCopyResult = {
  subject: string;
  text: string;
  html?: string;
};

export function getEmailCopy(
  template: 'welcome',
  language: EmailLanguage,
  params: WelcomeParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'trip_invite',
  language: EmailLanguage,
  params: TripInviteParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'expenses_summary',
  language: EmailLanguage,
  params: ExpensesSummaryParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'welcome' | 'trip_invite' | 'expenses_summary',
  language: EmailLanguage,
  params: WelcomeParams | TripInviteParams | ExpensesSummaryParams
): EmailCopyResult {
  const lang = language || 'en';

  switch (template) {
    case 'welcome':
      return getWelcomeCopy(lang, params as WelcomeParams);
    case 'trip_invite':
      return getTripInviteCopy(lang, params as TripInviteParams);
    case 'expenses_summary':
      return getExpensesSummaryCopy(lang, params as ExpensesSummaryParams);
  }
}

function getWelcomeCopy(language: EmailLanguage, params: WelcomeParams): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const firstName = params.firstName || null;
  const greeting = firstName
    ? language === 'es'
      ? `Hola ${firstName},`
      : `Hey ${firstName},`
    : language === 'es'
    ? 'Hola,'
    : 'Hey there,';

  if (language === 'es') {
    return {
      subject: 'Bienvenido a Kruno ✈️',
      text: `${greeting}

Bienvenido a Kruno! Estamos emocionados de ayudarte a planificar tu próxima aventura con menos estrés, menos decisiones y más confianza.

Con Kruno, puedes enfocarte en lo que más importa: disfrutar de tu viaje. Nosotros nos encargamos de la planificación, para que puedas vivir la experiencia.

Comienza creando tu primer itinerario en:
${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://kruno.app'}

¡Felices viajes!

Jose
Fundador, Kruno`,
    };
  }

  return {
    subject: 'Welcome to Kruno ✈️',
    text: `${greeting}

Welcome to Kruno! We're excited to help you plan your next adventure with less stress, fewer decisions, and more confidence.

With Kruno, you can focus on what matters most: enjoying your trip. We handle the planning, so you can experience the journey.

Get started by creating your first itinerary at:
${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://kruno.app'}

Happy travels!

Jose
Founder, Kruno`,
  };
}

function getTripInviteCopy(language: EmailLanguage, params: TripInviteParams): EmailCopyResult {
  const { tripName, inviterName, ctaUrl, deepLinkUrl } = params;
  const hasDeepLink = !!deepLinkUrl;

  if (language === 'es') {
    const subject = 'Has sido invitado a planificar un viaje en Kruno';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin-top: 0;">¡Has sido invitado! ✈️</h1>
    <p style="font-size: 16px; margin: 20px 0;">
      <strong>${inviterName}</strong> te ha invitado a colaborar en <strong>${tripName}</strong> en Kruno.
    </p>
    <p style="font-size: 16px; margin: 20px 0;">
      ¡Únete a este viaje para comenzar a planificar tu aventura juntos!
    </p>
    <div style="margin: 30px 0;">
      <a href="${ctaUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: ${hasDeepLink ? '12px' : '0'};">Unirse a este viaje</a>
      ${hasDeepLink ? `<a href="${deepLinkUrl}" style="display: inline-block; background-color: transparent; color: #2563eb; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px; border: 2px solid #2563eb;">Abrir en la app</a>` : ''}
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <a href="${ctaUrl}" style="color: #2563eb; word-break: break-all;">${ctaUrl}</a>
    </p>
    ${hasDeepLink ? `<p style="font-size: 14px; color: #666; margin-top: 12px;">
      O abre en la app móvil:<br>
      <a href="${deepLinkUrl}" style="color: #2563eb; word-break: break-all;">${deepLinkUrl}</a>
    </p>` : ''}
  </div>
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
    Esta invitación fue enviada por ${inviterName}. Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
  </p>
</body>
</html>
    `.trim();

    const text = `¡Has sido invitado!

${inviterName} te ha invitado a colaborar en ${tripName} en Kruno.

¡Únete a este viaje para comenzar a planificar tu aventura juntos!

Haz clic aquí para unirte: ${ctaUrl}
${hasDeepLink ? `\nO abre en la app móvil: ${deepLinkUrl}` : ''}

Esta invitación fue enviada por ${inviterName}. Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
    `.trim();

    return { subject, html, text };
  }

  const subject = "You've been invited to plan a trip on Kruno";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin-top: 0;">You've been invited! ✈️</h1>
    <p style="font-size: 16px; margin: 20px 0;">
      <strong>${inviterName}</strong> has invited you to collaborate on <strong>${tripName}</strong> in Kruno.
    </p>
    <p style="font-size: 16px; margin: 20px 0;">
      Join this trip to start planning your adventure together!
    </p>
    <div style="margin: 30px 0;">
      <a href="${ctaUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: ${hasDeepLink ? '12px' : '0'};">Join this trip</a>
      ${hasDeepLink ? `<a href="${deepLinkUrl}" style="display: inline-block; background-color: transparent; color: #2563eb; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px; border: 2px solid #2563eb;">Open in app</a>` : ''}
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${ctaUrl}" style="color: #2563eb; word-break: break-all;">${ctaUrl}</a>
    </p>
    ${hasDeepLink ? `<p style="font-size: 14px; color: #666; margin-top: 12px;">
      Or open in the mobile app:<br>
      <a href="${deepLinkUrl}" style="color: #2563eb; word-break: break-all;">${deepLinkUrl}</a>
    </p>` : ''}
  </div>
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
    This invitation was sent by ${inviterName}. If you didn't expect this invitation, you can safely ignore this email.
  </p>
</body>
</html>
  `.trim();

  const text = `You've been invited!

${inviterName} has invited you to collaborate on ${tripName} in Kruno.

Join this trip to start planning your adventure together!

Click here to join: ${ctaUrl}
${hasDeepLink ? `\nOr open in the mobile app: ${deepLinkUrl}` : ''}

This invitation was sent by ${inviterName}. If you didn't expect this invitation, you can safely ignore this email.
  `.trim();

  return { subject, html, text };
}

function getExpensesSummaryCopy(
  language: EmailLanguage,
  params: ExpensesSummaryParams
): EmailCopyResult {
  const { tripName, totalText, summaryText } = params;

  if (language === 'es') {
    return {
      subject: `Balance de gastos para "${tripName}"`,
      text: `Balance de gastos

${summaryText}

Este resumen muestra quién debe dinero y a quién se le debe dinero basado en los gastos registrados para este viaje.`,
    };
  }

  return {
    subject: `Balances for "${tripName}"`,
    text: `Expense Balance Summary

${summaryText}

This summary shows who owes money and who is owed money based on the expenses recorded for this trip.`,
  };
}

