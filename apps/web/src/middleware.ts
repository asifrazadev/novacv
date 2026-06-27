import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

// Use the Edge-safe config here — no pg, no bcrypt, no DB adapter.
// Only JWT decoding happens in the Edge Runtime.
const { auth } = NextAuth(authConfig)

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Auth disabled: let everything through, redirect auth pages → dashboard
  if (!AUTH_ENABLED) {
    if (pathname.startsWith("/login") || pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  const isAuthenticated = !!req.auth

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.match(/^\/resumes\/[^\/]+\/export$/)

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthenticated && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf)$).*)",
  ],
}
