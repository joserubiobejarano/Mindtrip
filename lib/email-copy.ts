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
  html?: string;
};

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

  if (language === 'es') {
    return {
      subject: 'Bienvenido a Kruno ✈️',
      text: `${greeting}

Bienvenido a Kruno! Estamos emocionados de ayudarte a planificar tu próxima aventura con menos estrés, menos decisiones y más confianza.

Con Kruno, puedes enfocarte en lo que más importa: disfrutar de tu viaje. Nosotros nos encargamos de la planificación, para que puedas vivir la experiencia.

Comienza creando tu primer itinerario en:
${process.env.APP_URL || 'https://kruno.app'}

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
${process.env.APP_URL || 'https://kruno.app'}

Happy travels!

Jose
Founder, Kruno`,
  };
}

function getTripReadyCopy(language: EmailLanguage, params: TripReadyParams): EmailCopyResult {
  const greeting = buildGreeting(language, params.firstName);
  const { tripCity, tripUrl } = params;

  if (language === 'es') {
    return {
      subject: `Tu viaje a ${tripCity} ya está listo ✈️`,
      text: `${greeting}

Tu viaje a ${tripCity} ya está listo!

Hemos preparado un itinerario claro con qué ver, cómo moverte y consejos prácticos para que disfrutes el viaje sin complicaciones.

Puedes ver tu itinerario aquí:
${tripUrl}

¡Buen viaje!
Jose
Fundador de Kruno`,
    };
  }

  return {
    subject: `Your trip to ${tripCity} is ready ✈️`,
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
    return {
      subject: 'Ahora eres un viajero Pro 🎉',
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

  return {
    subject: "You're now a Pro Traveller 🎉",
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
    return {
      subject: 'Tu suscripción a Kruno Pro ha sido cancelada',
      text: `${greeting}

Este correo confirma que tu suscripción a Kruno Pro ha sido cancelada.

Seguirás teniendo acceso a las funciones Pro hasta el final de tu periodo de facturación actual.

Si algún día decides volver, seguiremos aquí.

Gracias por probar la app,
Jose
Fundador de Kruno`,
    };
  }

  return {
    subject: 'Your Kruno Pro subscription has been canceled',
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
    return {
      subject: `Tu viaje a ${tripCity} empieza mañana ✈️`,
      text: `${greeting}

Te recordamos que tu viaje a ${tripCity} empieza mañana.

Aquí tienes tu itinerario por si quieres echarle un vistazo antes de salir:
${tripUrl}

¡Que tengas un viaje increíble!
Jose
Fundador de Kruno`,
    };
  }

  return {
    subject: `Your trip to ${tripCity} starts tomorrow ✈️`,
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

function buildNewsletterHtml(params: {
  subject: string;
  greeting: string;
  bodyLines: string[];
  ctaLabel: string;
  ctaUrl: string;
  fallbackLabel: string;
  manageUrl: string;
  footerLine: string;
}): string {
  const {
    subject,
    greeting,
    bodyLines,
    ctaLabel,
    ctaUrl,
    fallbackLabel,
    manageUrl,
    footerLine,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: left;">
    <h1 style="color: #2563eb; margin-top: 0; font-size: 24px;">${subject}</h1>
    <p style="font-size: 16px; margin: 16px 0;">${greeting}</p>
    ${bodyLines.map((line) => `<p style="font-size: 16px; margin: 16px 0;">${line}</p>`).join('')}
    <div style="margin: 28px 0;">
      <a href="${ctaUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">${ctaLabel}</a>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      ${fallbackLabel}<br>
      <a href="${ctaUrl}" style="color: #2563eb; word-break: break-all;">${ctaUrl}</a>
    </p>
  </div>
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
    ${footerLine} <a href="${manageUrl}" style="color: #2563eb;">${manageUrl}</a>
  </p>
</body>
</html>
  `.trim();
}

function getNewsletterConfirmCopy(
  language: EmailLanguage,
  params: NewsletterConfirmParams
): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = `Confirma tu suscripcion a ${appName}`;
    const text = `${greeting}

Gracias por suscribirte al newsletter de ${appName}.

Confirma tu suscripcion haciendo clic aqui:
${params.confirmUrl}

Si no solicitaste esto, ignora este correo.

Para darte de baja en cualquier momento:
${params.manageUrl}
    `.trim();

    return {
      subject,
      text,
      html: buildNewsletterHtml({
        subject,
        greeting,
        bodyLines: [
          `Gracias por suscribirte al newsletter de ${appName}.`,
          'Confirma tu suscripcion para empezar a recibir novedades y tips de viaje.',
        ],
        ctaLabel: 'Confirmar suscripcion',
        ctaUrl: params.confirmUrl,
        fallbackLabel: 'Si el boton no funciona, copia y pega este enlace:',
        manageUrl: params.manageUrl,
        footerLine: 'Puedes darte de baja cuando quieras:',
      }),
    };
  }

  const subject = `Confirm your ${appName} newsletter subscription`;
  const text = `${greeting}

Thanks for subscribing to the ${appName} newsletter.

Please confirm your subscription here:
${params.confirmUrl}

If you did not request this, you can ignore this email.

Unsubscribe any time:
${params.manageUrl}
  `.trim();

  return {
    subject,
    text,
    html: buildNewsletterHtml({
      subject,
      greeting,
      bodyLines: [
        `Thanks for subscribing to the ${appName} newsletter.`,
        'Confirm your subscription to start receiving updates and travel tips.',
      ],
      ctaLabel: 'Confirm subscription',
      ctaUrl: params.confirmUrl,
      fallbackLabel: "If the button doesn't work, copy and paste this link:",
      manageUrl: params.manageUrl,
      footerLine: 'Unsubscribe any time:',
    }),
  };
}

function getNewsletterWelcomeCopy(
  language: EmailLanguage,
  params: NewsletterWelcomeParams
): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    const subject = `Ya estas suscrito a ${appName}`;
    const text = `${greeting}

Tu suscripcion esta confirmada. A partir de ahora recibirás ideas de destinos, itinerarios y novedades de ${appName}.

Gracias por estar aqui,
Jose
Fundador de ${appName}

Gestiona tu suscripcion aqui:
${params.manageUrl}
    `.trim();

    return {
      subject,
      text,
      html: buildNewsletterHtml({
        subject,
        greeting,
        bodyLines: [
          `Tu suscripcion esta confirmada.`,
          `A partir de ahora recibiras ideas de destinos, itinerarios y novedades de ${appName}.`,
        ],
        ctaLabel: 'Ver novedades',
        ctaUrl: process.env.APP_URL || 'https://www.kruno.app',
        fallbackLabel: 'Si el boton no funciona, copia y pega este enlace:',
        manageUrl: params.manageUrl,
        footerLine: 'Puedes darte de baja cuando quieras:',
      }),
    };
  }

  const subject = `You're subscribed to ${appName} updates`;
  const text = `${greeting}

Your subscription is confirmed. You'll now receive destination ideas, itineraries, and ${appName} updates.

Thanks for being here,
Jose
Founder, ${appName}

Manage your subscription here:
${params.manageUrl}
  `.trim();

  return {
    subject,
    text,
    html: buildNewsletterHtml({
      subject,
      greeting,
      bodyLines: [
        'Your subscription is confirmed.',
        `You'll now receive destination ideas, itineraries, and ${appName} updates.`,
      ],
      ctaLabel: 'Explore Kruno',
      ctaUrl: process.env.APP_URL || 'https://www.kruno.app',
      fallbackLabel: "If the button doesn't work, copy and paste this link:",
      manageUrl: params.manageUrl,
      footerLine: 'Unsubscribe any time:',
    }),
  };
}

function getNewsletterUnsubscribedCopy(
  language: EmailLanguage,
  params: NewsletterUnsubscribedParams
): EmailCopyResult {
  const appName = params.appName || 'Kruno';
  const greeting = buildGreeting(language, params.firstName);

  if (language === 'es') {
    return {
      subject: `Te has dado de baja de ${appName}`,
      text: `${greeting}

Tu suscripcion al newsletter de ${appName} ha sido cancelada.

Si fue un error, puedes volver a suscribirte en cualquier momento desde nuestra web.

Gracias,
Jose
Fundador de ${appName}
      `.trim(),
    };
  }

  return {
    subject: `You're unsubscribed from ${appName}`,
    text: `${greeting}

You have been unsubscribed from the ${appName} newsletter.

If this was a mistake, you can resubscribe anytime on our website.

Thanks,
Jose
Founder, ${appName}
    `.trim(),
  };
}

