import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opId } = await params;
    const body = await request.json();
    const { updates, userId, date } = body; 
    let dbUser = await prisma.user.findUnique({ where: { username: userId } });
    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }
    const finalUserId = dbUser ? dbUser.id : userId;

    const createdProgress = [];
    for (const update of updates) {
      if (update.pairs > 0) {
        const progress = await prisma.dailyProgress.create({
          data: {
            size: update.size,
            date: date ? new Date(date) : undefined,
            pairs: update.pairs,
            userId: finalUserId,
            operationId: opId
          }
        });
        createdProgress.push(progress);
      }
    }

    // Auto-finish logic check
    const operation = await prisma.operation.findUnique({
      where: { id: opId },
      include: {
        article: true,
        dailyProgresses: true
      }
    });

    if (operation && operation.article) {
      const totalSubmitted = operation.dailyProgresses.reduce((sum, p) => sum + p.pairs, 0);
      let totalRequired = 0;
      if (operation.article.sizePairs) {
        try {
          const sp = JSON.parse(operation.article.sizePairs);
          totalRequired = sp.reduce((sum: number, item: any) => sum + (parseInt(item.pairs) || 0), 0);
        } catch(e) {}
      }
      
      if (totalRequired > 0 && totalSubmitted >= totalRequired && operation.status !== 'done') {
        await prisma.operation.update({
          where: { id: opId },
          data: {
            status: 'done',
            completedDate: new Date().toISOString()
          }
        });
      } else if (operation.status === 'pending' && totalSubmitted > 0) {
        await prisma.operation.update({
          where: { id: opId },
          data: {
            status: 'in_progress'
          }
        });
      }
    }

    return NextResponse.json({ success: true, count: createdProgress.length });
  } catch (error) {
    console.error("Progress Error:", error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
