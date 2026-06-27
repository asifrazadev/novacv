import { NextResponse } from "next/server"

/**
 * Validates whether an origin is allowed to call the extension API endpoints.
 * Accepts: chrome-extension://* origins (any installed extension) and the
 * configured app URL (for same-origin calls and local dev).
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (origin.startsWith("chrome-extension://")) return true
  if (origin.startsWith("moz-extension://")) return true
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  if (appUrl && origin === appUrl) return true
  if (process.env.NODE_ENV === "development") {
    if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) return true
  }
  return false
}

export function setCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }
  // No wildcard fallback — if origin is not allowed, no ACAO header is set.
  return response
}

export function corsOptions(request: Request, methods: string): NextResponse {
  const origin = request.headers.get("origin")
  const res = new NextResponse(null, { status: 204 })
  setCorsHeaders(res, origin)
  res.headers.set("Access-Control-Allow-Methods", methods)
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return res
}
