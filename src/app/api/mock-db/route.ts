import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tableName, data } = await request.json();
    
    if (!tableName || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Update server-side global memory store
    const globalStore = (globalThis as any)._mock_db || {};
    globalStore[tableName] = data;
    (globalThis as any)._mock_db = globalStore;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
