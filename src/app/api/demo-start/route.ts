import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const cookieStore = await cookies()

  // Pose un cookie démo valable 1h — lu par le dashboard/layout pour bypasser l'auth
  cookieStore.set('crm_demo', '1', {
    maxAge: 60 * 60,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return NextResponse.redirect(new URL('/dashboard?demo=true', origin))
}
