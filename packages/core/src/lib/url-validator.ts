/**
 * URL validation utilities to ensure URLs are safe and properly formatted.
 */

/**
 * Validates if a URL is properly formatted and safe to use.
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false

  const trimmed = url.trim()
  if (!trimmed) return false

  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    // Check for valid protocols (http, https, mailto, etc.)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitizes a URL by ensuring it has a valid protocol.
 * Returns the original URL if valid, or with https:// prepended if it's a valid domain.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()
  if (!trimmed) return null

  // Already has a protocol
  if (/^(https?|mailto|tel):/.test(trimmed)) {
    return isValidUrl(trimmed) ? trimmed : null
  }

  // Try to add https://
  const withProtocol = `https://${trimmed}`
  return isValidUrl(withProtocol) ? withProtocol : null
}

/**
 * Validates a list of URLs and returns only the valid ones.
 */
export function filterValidUrls(urls: (string | null | undefined)[]): string[] {
  return urls
    .map(url => sanitizeUrl(url))
    .filter((url): url is string => url !== null)
}
