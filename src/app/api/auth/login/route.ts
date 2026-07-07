import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Call Laravel Auth API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.jbrendyr.com/api';
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmedEmail, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || 'Login gagal, periksa email & password Anda' },
        { status: 401 }
      );
    }

    const authData = await res.json();
    const session = {
      access_token: authData.token,
      refresh_token: authData.token,
      expires_in: 3600 * 24 * 30, // 30 days
    };
    const user = {
      id: authData.user.id,
      email: authData.user.email,
      user_metadata: { role: authData.user.role },
    };
    const cookieStore = await cookies();

    // Set secure HTTP-only cookies for authentication
    cookieStore.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in,
    });

    cookieStore.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
