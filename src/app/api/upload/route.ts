import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Extract File
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { data, error } = await supabase
      .storage
      .from('saas-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 });
    }

    // 4. Get Public URL
    const { data: urlData } = supabase
      .storage
      .from('saas-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
