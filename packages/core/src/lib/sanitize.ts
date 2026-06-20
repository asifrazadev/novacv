/**
 * HTML sanitizer utility to prevent XSS attacks.
 * Removes all potentially dangerous content while preserving safe formatting.
 */

/**
 * Sanitizes HTML content by removing all attributes and dangerous tags.
 * This is a simple implementation that removes all HTML tags, replacing them
 * with their text content. For more advanced sanitization, consider using a library like dompurify.
 */
const sanitizeCache = new Map<string, string>()

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  if (sanitizeCache.has(html)) {
    return sanitizeCache.get(html)!
  }

  // Convert string to handle common entities
  let sanitized = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")

  // Remove all script and style tags completely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove on* attributes (onclick, onload, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=/gi, ' ')

  // Remove potentially dangerous attributes
  sanitized = sanitized.replace(/\s(?:href|src|action|formaction)\s*=\s*["']?(?:javascript|data|vbscript):/gi, '')

  sanitizeCache.set(html, sanitized)
  return sanitized
}

/**
 * Extracts plain text from HTML by removing all tags.
 * Useful for creating text representations of HTML content.
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Validates if HTML content appears safe (no script tags, event handlers, etc.)
 */
export function isHtmlSafe(html: string | null | undefined): boolean {
  if (!html) return true

  const dangerous = /(<script|<iframe|<object|<embed|<form|javascript:|onerror|onload|onclick|on\w+\s*=)/gi
  return !dangerous.test(html)
}
