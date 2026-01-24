import type { Language } from './i18n';

export type EmailLanguage = Language;

type WelcomeParams = {
  firstName?: string | null;
  appName?: string;
};

type TripReadyParams = {
  firstName?: string | null;
  tripName: string;
  tripCity: string;
  tripUrl: string;
};

type ProUpgradeParams = {
  firstName?: string | null;
  billingUrl: string;
};

type SubscriptionCanceledParams = {
  firstName?: string | null;
};

type TripReminderParams = {
  firstName?: string | null;
  tripCity: string;
  tripStartDate: string;
  tripUrl: string;
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

type NewsletterConfirmParams = {
  firstName?: string | null;
  confirmUrl: string;
  manageUrl: string;
  appName?: string;
};

type NewsletterWelcomeParams = {
  firstName?: string | null;
  manageUrl: string;
  appName?: string;
};

type NewsletterUnsubscribedParams = {
  firstName?: string | null;
  appName?: string;
};

type EmailCopyResult = {
  subject: string;
  text: string;
  // html field removed - all emails are plain text only
};

const EMAIL_BRAND = {
  primary: 'hsl(6, 85%, 67%)',
  background: 'hsl(30, 50%, 96%)',
  border: 'hsl(30, 20%, 90%)',
  text: '#2f2f2f',
  muted: '#6b6b6b',
  radius: '16px',
  font:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const EMAIL_LOGO_URL = process.env.EMAIL_LOGO_URL || 'https://www.kruno.app/logo-email.png';

// HTML builder functions below are unused - all emails are plain text only
// Kept for reference but not called anywhere

function buildEmailLayout(params: {
  subject: string;
  contentHtml: string;
  footerHtml?: string;
  align?: 'left' | 'center';
}): string {
  const { subject, contentHtml, footerHtml, align = 'left' } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_BRAND.background}; font-family: ${EMAIL_BRAND.font}; color: ${EMAIL_BRAND.text};">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 16px;">
      <img src="${EMAIL_LOGO_URL}" alt="Kruno" style="display: block; margin: 0 auto; max-width: 120px; width: 100%; height: auto;">
    </div>
    <div style="background-color: #ffffff; border-radius: ${EMAIL_BRAND.radius}; padding: 28px; border: 1px solid ${EMAIL_BRAND.border};">
      <div style="text-align: ${align};">
        <h1 style="margin: 0 0 16px 0; font-size: 24px; line-height: 1.3; color: ${EMAIL_BRAND.text};">${subject}</h1>
        ${contentHtml}
      </div>
    </div>
    ${footerHtml ? `<p style="font-size: 12px; color: ${EMAIL_BRAND.muted}; text-align: center; margin: 18px 0 0;">${footerHtml}</p>` : ''}
  </div>
</body>
</html>
  `.trim();
}

function buildParagraphs(lines: string[], align: 'left' | 'center' = 'left'): string {
  return lines
    .map(
      (line) =>
        `<p style="font-size: 16px; line-height: 1.6; margin: 16px 0; color: ${EMAIL_BRAND.text}; text-align: ${align};">${line}</p>`
    )
    .join('');
}

function buildPrimaryButton(label: string, url: string): string {
  return `<a href="${url}" style="display: inline-block; background-color: ${EMAIL_BRAND.primary}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: ${EMAIL_BRAND.radius}; font-weight: 600; font-size: 16px;">${label}</a>`;
}

function buildSecondaryButton(label: string, url: string): string {
  return `<a href="${url}" style="display: inline-block; background-color: transparent; color: ${EMAIL_BRAND.primary}; text-decoration: none; padding: 12px 24px; border-radius: ${EMAIL_BRAND.radius}; font-weight: 600; font-size: 16px; border: 2px solid ${EMAIL_BRAND.primary};">${label}</a>`;
}

function buildInlineLink(label: string, url: string): string {
  return `<a href="${url}" style="color: ${EMAIL_BRAND.primary}; text-decoration: none; font-weight: 600;">${label}</a>`;
}

export function getEmailCopy(
  template: 'welcome',
  language: EmailLanguage,
  params: WelcomeParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'trip_ready',
  language: EmailLanguage,
  params: TripReadyParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'pro_upgrade',
  language: EmailLanguage,
  params: ProUpgradeParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'subscription_canceled',
  language: EmailLanguage,
  params: SubscriptionCanceledParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'trip_reminder',
  language: EmailLanguage,
  params: TripReminderParams
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
  template: 'newsletter_confirm',
  language: EmailLanguage,
  params: NewsletterConfirmParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'newsletter_welcome',
  language: EmailLanguage,
  params: NewsletterWelcomeParams
): EmailCopyResult;
export function getEmailCopy(
  template: 'newsletter_unsubscribed',
  language: EmailLanguage,
  params: NewsletterUnsubscribedParams
): EmailCopyResult;
export function getEmailCopy(
  template:
    | 'welcome'
    | 'trip_ready'
    | 'pro_upgrade'
    | 'subscription_canceled'
    | 'trip_reminder'
    | 'trip_invite'
    | 'expenses_summary'
    | 'newsletter_confirm'
    | 'newsletter_welcome'
    | 'newsletter_unsubscribed',
  language: EmailLanguage,
  params:
    | WelcomeParams
    | TripReadyParams
    | ProUpgradeParams
    | SubscriptionCanceledParams
    | TripReminderParams
    | TripInviteParams
    | ExpensesSummaryParams
    | NewsletterConfirmParams
    | NewsletterWelcomeParams
    | NewsletterUnsubscribedParams
): EmailCopyResult {
  const lang = language || 'en';

  switch (template) {
    case 'welcome':
      return getWelcomeCopy(lang, params as WelcomeParams);
    case 'trip_ready':
      return getTripReadyCopy(lang, params as TripReadyParams);
    case 'pro_upgrade':
      return getProUpgradeCopy(lang, params as ProUpgradeParams);
    case 'subscription_canceled':
      return getSubscriptionCanceledCopy(lang, params as SubscriptionCanceledParams);
    case 'trip_reminder':
      return getTripReminderCopy(lang, params as TripReminderParams);
    case 'trip_invite':
      return getTripInviteCopy(lang, params as TripInviteParams);
    case 'expenses_summary':
      return getExpensesSummaryCopy(lang, params as ExpensesSummaryParams);
    case 'newsletter_confirm':
      return getNewsletterConfirmCopy(lang, params as NewsletterConfirmParams);
    case 'newsletter_welcome':
      return getNewsletterWelcomeCopy(lang, params as NewsletterWelcomeParams);
    case 'newsletter_unsubscribed':
      return getNewsletterUnsubscribedCopy(lang, params as NewsletterUnsubscribedParams);
  }
}

function buildGreeting(language: EmailLanguage, firstName?: string | null): string {
  if (firstName) {
    return language === 'es' ? `Hola ${firstName},` : `Hey ${firstName},`;
  }

  return language === 'es' ? 'Hola,' : 'Hey there,';
}

function getWelcomeCopy(language: EmailLanguage, params: WelcomeParams): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);
  const appUrl = process.env.APP_URL || 'https://kruno.app';

  if (language === 'es') {
    const subject = 'Bienvenido a Kruno ✈️';

    return {
      subject,
      text: `${greeting}

¡Bienvenido a ${appName}! Estamos emocionados de ayudarte a planificar tu próxima aventura con menos estrés, menos decisiones y más confianza.

Con ${appName}, puedes enfocarte en lo que más importa: disfrutar de tu viaje. Nosotros nos encargamos de la planificación, para que puedas vivir la experiencia.

Comienza creando tu primer itinerario en:
${appUrl}

¡Felices viajes!

Jose
Fundador, ${appName}`,
    };
  }

  const subject = 'Welcome to Kruno ✈️';

  return {
    subject,
    text: `${greeting}

Welcome to ${appName}! We're excited to help you plan your next adventure with less stress, fewer decisions, and more confidence.

With ${appName}, you can focus on what matters most: enjoying your trip. We handle the planning, so you can experience the journey.

Get started by creating your first itinerary at:
${appUrl}

Happy travels!

Jose
Founder, ${appName}`,
  };
}

function getTripReadyCopy(language: EmailLanguage, params: TripReadyParams): EmailCopyResult {
  const greeting = buildGreeting(language, params.firstName);
  const { tripCity, tripUrl } = params;

  if (language === 'es') {
    const subject = `Tu viaje a ${tripCity} ya está listo ✈️`;

    return {
      subject,
      text: `${greeting}

Tu viaje a ${tripCity} ya está listo.

Hemos preparado un itinerario claro con qué ver, cómo moverte y consejos prácticos para que disfrutes el viaje sin complicaciones.

Puedes ver tu itinerario aquí:
${tripUrl}

¡Buen viaje!
Jose
Fundador de Kruno`,
    };
  }

  const subject = `Your trip to ${tripCity} is ready ✈️`;

  return {
    subject,
    text: `${greeting}

Your trip to ${tripCity} is ready.

We've put together a clear itinerary with what to see, how to move around, and practical tips to help you enjoy the trip with less stress.

You can view your itinerary here:
${tripUrl}

Have a great trip,
Jose
Founder of Kruno`,
  };
}

function getProUpgradeCopy(language: EmailLanguage, params: ProUpgradeParams): EmailCopyResult {
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = 'Ahora eres un viajero Pro 🎉';

    return {
      subject,
      text: `${greeting}

Te confirmamos tu suscripción a Kruno Pro.

Ahora puedes crear y gestionar todos los viajes que quieras y aprovechar al máximo la planificación.

Puedes gestionar tu suscripción aquí:
${params.billingUrl}

Gracias por confiar en nosotros,
Jose
Fundador de Kruno`,
    };
  }

  const subject = "You're now a Pro Traveller 🎉";

  return {
    subject,
    text: `${greeting}

Your upgrade to Kruno Pro is confirmed.

You can now create and manage as many trips as you like and make the most out of your travel planning.

You can manage your subscription here:
${params.billingUrl}

Thanks for supporting us,
Jose
Founder of Kruno`,
  };
}

function getSubscriptionCanceledCopy(
  language: EmailLanguage,
  params: SubscriptionCanceledParams
): EmailCopyResult {
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = 'Tu suscripción a Kruno Pro ha sido cancelada';

    return {
      subject,
      text: `${greeting}

Este correo confirma que tu suscripción a Kruno Pro ha sido cancelada.

Seguirás teniendo acceso a las funciones Pro hasta el final de tu periodo de facturación actual.

Si algún día decides volver, seguiremos aquí.

Gracias por probar la app,
Jose
Fundador de Kruno`,
    };
  }

  const subject = 'Your Kruno Pro subscription has been canceled';

  return {
    subject,
    text: `${greeting}

This email confirms that your Kruno Pro subscription has been canceled.

You'll continue to have access to Pro features until the end of your current billing period.

If you ever decide to come back, Kruno will be here.

Thanks for trying the app,
Jose
Founder of Kruno`,
  };
}

function getTripReminderCopy(language: EmailLanguage, params: TripReminderParams): EmailCopyResult {
  const greeting = buildGreeting(language, params.firstName);
  const { tripCity, tripUrl } = params;

  if (language === 'es') {
    const subject = `Tu viaje a ${tripCity} empieza mañana ✈️`;

    return {
      subject,
      text: `${greeting}

Te recordamos que tu viaje a ${tripCity} empieza mañana.

Aquí tienes tu itinerario por si quieres echarle un vistazo antes de salir:
${tripUrl}

¡Que tengas un viaje increíble!
Jose
Fundador de Kruno`,
    };
  }

  const subject = `Your trip to ${tripCity} starts tomorrow ✈️`;

  return {
    subject,
    text: `${greeting}

Just a quick reminder that your trip to ${tripCity} starts tomorrow.

Here's your itinerary in case you want to take a look before you go:
${tripUrl}

Have an amazing trip
Jose
Founder of Kruno`,
  };
}

function getTripInviteCopy(language: EmailLanguage, params: TripInviteParams): EmailCopyResult {
  const { tripName, inviterName, ctaUrl, deepLinkUrl } = params;
  const hasDeepLink = !!deepLinkUrl;

  if (language === 'es') {
    const subject = 'Has sido invitado a planificar un viaje en Kruno';

    const text = `${inviterName} te ha invitado a colaborar en ${tripName} en Kruno.

¡Únete a este viaje para comenzar a planificar tu aventura juntos!

Únete aquí:
${ctaUrl}
${hasDeepLink ? `\nO abre en la app móvil:\n${deepLinkUrl}` : ''}

Esta invitación fue enviada por ${inviterName}. Si no esperabas esta invitación, puedes ignorar este correo de forma segura.`;

    return { subject, text };
  }

  const subject = "You've been invited to plan a trip on Kruno";

  const text = `${inviterName} has invited you to collaborate on ${tripName} in Kruno.

Join this trip to start planning your adventure together!

Join here:
${ctaUrl}
${hasDeepLink ? `\nOr open in the mobile app:\n${deepLinkUrl}` : ''}

This invitation was sent by ${inviterName}. If you didn't expect this invitation, you can safely ignore this email.`;

  return { subject, text };
}

function getExpensesSummaryCopy(
  language: EmailLanguage,
  params: ExpensesSummaryParams
): EmailCopyResult {
  const { tripName, totalText, summaryText } = params;

  if (language === 'es') {
    const subject = `Balance de gastos para "${tripName}"`;

    return {
      subject,
      text: `Balance de gastos

${totalText}

${summaryText}

Este resumen muestra quién debe dinero y a quién se le debe dinero basado en los gastos registrados para este viaje.`,
    };
  }

  const subject = `Balances for "${tripName}"`;

  return {
    subject,
    text: `Expense Balance Summary

${totalText}

${summaryText}

This summary shows who owes money and who is owed money based on the expenses recorded for this trip.`,
  };
}

// Unused - kept for reference only
function buildNewsletterHtml(params: {
  subject: string;
  greeting: string;
  bodyLines: string[];
  ctaLabel: string;
  ctaUrl: string;
  fallbackLabel?: string;
  fallbackLinkLabel?: string;
  manageUrl: string;
}): string {
  const {
    subject,
    greeting,
    bodyLines,
    ctaLabel,
    ctaUrl,
    fallbackLabel,
    fallbackLinkLabel,
    manageUrl,
  } = params;

  const contentHtml = `
    <p style="font-size: 16px; margin: 16px 0; color: ${EMAIL_BRAND.text};">${greeting}</p>
    ${buildParagraphs(bodyLines, 'left')}
    <div style="margin: 24px 0;">
      ${buildPrimaryButton(ctaLabel, ctaUrl)}
    </div>
    ${
      fallbackLabel
        ? `<p style="font-size: 14px; color: ${EMAIL_BRAND.muted}; margin-top: 16px;">
            ${fallbackLabel} ${buildInlineLink(fallbackLinkLabel || 'Confirm here', ctaUrl)}
          </p>`
        : ''
    }
  `;

  return buildEmailLayout({
    subject,
    contentHtml,
    footerHtml: buildInlineLink('Unsubscribe', manageUrl),
  });
}

function getNewsletterConfirmCopy(
  language: EmailLanguage,
  params: NewsletterConfirmParams
): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = `Confirma tu suscripción a ${appName}`;

    return {
      subject,
      text: `${greeting}

Gracias por unirte a las novedades de ${appName}.

Confirma tu suscripción aquí:
${params.confirmUrl}

Si no solicitaste esto, ignora este correo.

Unsubscribe:
${params.manageUrl}`,
    };
  }

  const subject = `Confirm your ${appName} subscription`;

  return {
    subject,
    text: `${greeting}

Thanks for joining ${appName} updates.

Please confirm your subscription here:
${params.confirmUrl}

If you did not request this, you can ignore this email.

Unsubscribe:
${params.manageUrl}`,
  };
}

function getNewsletterWelcomeCopy(
  language: EmailLanguage,
  params: NewsletterWelcomeParams
): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = `¡Listo! Ya estás suscrito a ${appName}`;

    return {
      subject,
      text: `${greeting}

¡Tu suscripción está confirmada! A partir de ahora recibirás ideas de destinos, itinerarios y novedades de ${appName}.

Gracias por estar aqui,
Jose
Fundador de ${appName}

Unsubscribe:
${params.manageUrl}`,
    };
  }

  const subject = `You're in! Welcome to ${appName}`;

  return {
    subject,
    text: `${greeting}

Your subscription is confirmed. You'll now receive destination ideas, itineraries, and ${appName} updates.

Thanks for being here,
Jose
Founder, ${appName}

Unsubscribe:
${params.manageUrl}`,
  };
}

function getNewsletterUnsubscribedCopy(
  language: EmailLanguage,
  params: NewsletterUnsubscribedParams
): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = `Te has dado de baja de ${appName}`;

    return {
      subject,
      text: `${greeting}

Tu suscripción al newsletter de ${appName} ha sido cancelada.

Te vamos a extrañar. Si fue un error, puedes volver a suscribirte cuando quieras desde nuestra web.

Gracias,
Jose
Fundador de ${appName}`,
    };
  }

  const subject = `You're unsubscribed from ${appName}`;

  return {
    subject,
    text: `${greeting}

You have been unsubscribed from the ${appName} newsletter.

We'll miss you. If it was a mistake, you can resubscribe anytime on our website.

Thanks,
Jose
Founder, ${appName}`,
  };
}

