import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://novacv.onrender.com'
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://novacv.onrender.com'
  return NextResponse.redirect(`${baseUrl}/login?message=Could not authenticate with provider`)
}