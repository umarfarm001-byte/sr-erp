import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { confirmPhrase } = await request.json();
    
    if (confirmPhrase !== 'NEW_YEAR') {
      return NextResponse.json({ error: 'Invalid confirmation phrase' }, { status: 400 });
    }

    // 1. Create a backup of the current database
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupPath = path.join(process.cwd(), 'prisma', `dev_backup_${new Date().getFullYear()}_${Date.now()}.db`);
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    // 2. Wipe transactional data (Orders, History) but KEEP Master Data & Users
    // Operations and DailyProgress will cascade delete automatically
    await prisma.article.deleteMany({});
    await prisma.bomHistory.deleteMany({});

    return NextResponse.json({ success: true, message: 'Financial year archived successfully. Database wiped.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
