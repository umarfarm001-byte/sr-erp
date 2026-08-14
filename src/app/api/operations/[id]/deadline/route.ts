import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetDate, isAdmin } = body;

    if (!targetDate) {
      return NextResponse.json({ error: 'Target date is required' }, { status: 400 });
    }

    const operation = await prisma.operation.findUnique({
      where: { id },
      include: { article: true }
    });

    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    let shiftDays = 0;
    if (isAdmin && operation.targetDate) {
      const oldDate = new Date(operation.targetDate);
      const newDate = new Date(targetDate);
      shiftDays = Math.round((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    await prisma.operation.update({
      where: { id },
      data: { targetDate }
    });

    if (shiftDays !== 0) {
      const allOps = await prisma.operation.findMany({
        where: { articleId: operation.articleId },
        orderBy: { opId: 'asc' }
      });

      const currentOpId = operation.opId;

      const isDependent = (curId: number, nextId: number) => {
        if (nextId <= curId) return false;
        
        // Preparation steps (purchases) do not depend on anything
        if ((nextId >= 1 && nextId <= 4) || (nextId >= 39 && nextId <= 41)) {
          return false;
        }

        // Leather Cutting only depends on Leather Purchase
        if (nextId === 5 || nextId === 42) {
          if (curId === 2 || curId === 39) return true;
          return false;
        }

        // Lining Cutting only depends on Lining Purchase
        if (nextId === 6 || nextId === 43) {
          if (curId === 3 || curId === 40) return true;
          return false;
        }

        // All other steps (Closing, Lasting, etc.) depend on ALL previous steps.
        return true;
      };

      for (const nextOp of allOps) {
        if (nextOp.targetDate && isDependent(currentOpId, nextOp.opId)) {
          const oldNextDate = new Date(nextOp.targetDate);
          oldNextDate.setDate(oldNextDate.getDate() + shiftDays);
          const newNextDateStr = oldNextDate.toISOString().split('T')[0];
          
          await prisma.operation.update({
            where: { id: nextOp.id },
            data: { targetDate: newNextDateStr }
          });
        }
      }
    }

    return NextResponse.json({ success: true, shiftDays });
  } catch (error) {
    console.error("Deadline Update Error:", error);
    return NextResponse.json({ error: 'Failed to update deadline' }, { status: 500 });
  }
}
