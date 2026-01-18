import type { EmailLanguage } from '../email-copy';

export function normalizeEmailLanguage(locale?: string | null): EmailLanguage {
  if (!locale) return 'en';
  const normalized = locale.toLowerCase();
  return normalized === 'es' || normalized.startsWith('es-') ? 'es' : 'en';
}

export function getFirstNameFromFullName(fullName?: string | null): string | null {
  if (!fullName) return null;
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || null;
}
