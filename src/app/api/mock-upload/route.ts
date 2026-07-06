import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const filePathParam = formData.get('filePath') as string | null;

    if (!file || !filePathParam) {
      return NextResponse.json({ error: 'Missing file or filePath' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract file extension and construct safe filename
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    // Define the upload path inside the public/ directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file to public/uploads
    const fullPath = path.join(uploadDir, cleanFileName);
    fs.writeFileSync(fullPath, buffer);

    const publicUrl = `/uploads/${cleanFileName}`;

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    console.error('Error in mock-upload route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
