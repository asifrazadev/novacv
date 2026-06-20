import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = (pathname: string) => {
    if (pathname === '/') return true
    return ['/login', '/register', '/p/', '/forgot-password', '/reset-password', '/auth/', '/api/health'].some((route) => pathname.startsWith(route))
  }

  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    // no user, redirect to login unless on public route
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    
    const redirectResponse = NextResponse.redirect(url)
    // Persist any cookie updates made by Supabase client
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // if user is logged in, redirect away from auth routes to dashboard
  if (user && ['/login', '/register'].some((route) => request.nextUrl.pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    
    const redirectResponse = NextResponse.redirect(url)
    // Persist any cookie updates made by Supabase client
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return supabaseResponse
}
