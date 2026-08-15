import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const suggestions = await prisma.masterMaterial.findMany({
      select: {
        id: true,
        name: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
