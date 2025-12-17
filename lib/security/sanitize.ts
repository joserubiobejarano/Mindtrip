import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a window object for DOMPurify in Node.js environment
const window = new JSDOM('').window;
// Type assertion needed because JSDOM's Window type doesn't exactly match DOMPurify's expected type
const purify = DOMPurify(window as any);

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Removes dangerous HTML tags and attributes while preserving safe formatting.
 * 
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'blockquote', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitizes plain text by escaping HTML entities.
 * Use this for user input that should be displayed as plain text.
 * 
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitizes user notes/descriptions.
 * Allows basic formatting but removes dangerous content.
 * 
 * @param content - User content to sanitize
 * @returns Sanitized content
 */
export function sanitizeUserContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // First escape HTML, then allow safe tags back
  return sanitizeHtml(content);
}

/**
 * Sanitizes chat messages.
 * More restrictive - only allows plain text formatting.
 * 
 * @param message - Chat message to sanitize
 * @returns Sanitized message
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // For chat, we want to be more restrictive
  return purify.sanitize(message, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
}
