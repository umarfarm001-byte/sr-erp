import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const history = await prisma.bomHistory.findMany({
      orderBy: { date: 'desc' },
      take: 50 // Limit to last 50 for performance
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching BOM history:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEntry = await prisma.bomHistory.create({
      data: {
        articleName: body.articleName,
        leatherName: body.leatherName,
        patternArea: parseFloat(body.patternArea),
        grade: body.grade,
        wastage: parseFloat(body.wastage),
        totalSqFt: parseFloat(body.totalSqFt),
        ratePerSqFt: parseFloat(body.ratePerSqFt),
        totalCost: parseFloat(body.totalCost)
      }
    });
    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Error saving BOM history:", error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
