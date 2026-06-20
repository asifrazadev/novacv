import React from "react"

/**
 * Renders a linked or plain-text title based on resume item fields.
 * Always links the fallback name itself (no separate display label).
 */
export function LinkedTitle({
  show,
  url,
  fallback,
  color,
  className = "",
}: {
  show?: boolean
  url?: string
  fallback: string
  color?: string
  className?: string
}) {
  if (show && url) {
    const href = url.startsWith("http") ? url : `https://${url}`
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:underline ${className}`}
        style={color ? { color } : undefined}
      >
        {fallback}
      </a>
    )
  }
  return <>{fallback}</>
}
