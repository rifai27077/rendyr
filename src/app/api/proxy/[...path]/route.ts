import { NextRequest, NextResponse } from 'next/server';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'https://api.jbrendyr.com/api';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path);
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path);
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const targetUrl = `${LARAVEL_API}/${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Mimic browser request so cPanel doesn't redirect
    'User-Agent': 'Mozilla/5.0 (compatible; Vercel/1.0)',
    'Host': 'api.jbrendyr.com',
    'Origin': 'https://api.jbrendyr.com',
    'Referer': 'https://api.jbrendyr.com/',
  };

  let body: BodyInit | undefined = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      body = await req.formData();
      delete headers['Content-Type'];
    } else {
      body = await req.text();
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual', // Don't follow redirects
    });

    // If we get a redirect, log it and return error
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.error(`[Proxy] Redirect detected: ${targetUrl} -> ${location}`);
      return NextResponse.json(
        { error: 'API server redirect', redirectTo: location, targetUrl },
        { status: 502 }
      );
    }

    const text = await response.text();

    // Try to parse as JSON, fallback to empty array
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(`[Proxy] Non-JSON response from ${targetUrl}:`, text.slice(0, 200));
      data = [];
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    console.error('[Proxy] Fetch error:', err.message);
    return NextResponse.json({ error: 'Proxy failed', detail: err.message }, { status: 502 });
  }
}
