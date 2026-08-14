import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const allArticles = await prisma.article.findMany({
      include: { operations: true }
    });

    let completedArticlesCount = 0;
    let sampleActive = 0;
    let bulkActive = 0;
    let samplePairs = 0;
    let bulkPairs = 0;

    let overdueOps = 0;
    let onTimeOps = 0;
    let totalPendingOps = 0;
    
    const now = new Date();

    for (const article of allArticles) {
      const totalOps = article.operations.length;
      const completedOps = article.operations.filter(o => o.status === 'done').length;
      
      const isCompleted = totalOps > 0 && completedOps === totalOps;
      
      if (isCompleted) {
        completedArticlesCount++;
        continue;
      }

      if (article.type === 'sample') {
        sampleActive++;
        try {
          const sp = JSON.parse(article.sizePairs || '[]');
          samplePairs += sp.reduce((acc: number, curr: any) => acc + (parseInt(curr.pairs, 10) || 0), 0);
        } catch(e) {}
      } else {
        bulkActive++;
        bulkPairs += parseInt(article.qty || '0', 10) || 0;
      }

      for (const op of article.operations) {
        if (op.status === 'pending' || op.status === 'in_progress') {
          totalPendingOps++;
          if (op.targetDate) {
            const target = new Date(op.targetDate);
            if (target < now) {
              overdueOps++;
            } else {
              onTimeOps++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      activeOrders: {
        sample: sampleActive,
        bulk: bulkActive,
        total: sampleActive + bulkActive
      },
      completedOrders: completedArticlesCount,
      activePairs: {
        sample: samplePairs,
        bulk: bulkPairs,
        total: samplePairs + bulkPairs
      },
      operations: {
        overdue: overdueOps,
        onTime: onTimeOps,
        totalPending: totalPendingOps
      }
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
