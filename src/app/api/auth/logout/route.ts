import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Invoke sign out in Supabase client (optional but good practice)
    await supabase.auth.signOut();

    // Clear session cookies
    const cookieStore = await cookies();
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');

    // Redirect to login page
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat logout' }, { status: 500 });
  }
}
