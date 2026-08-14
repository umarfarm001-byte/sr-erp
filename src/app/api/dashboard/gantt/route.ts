import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const allArticles = await prisma.article.findMany({
      include: { operations: true },
      orderBy: { date: 'asc' } // Oldest first
    });

    const activeOrders = [];

    for (const article of allArticles) {
      const totalOps = article.operations.length;
      const completedOps = article.operations.filter(o => o.status === 'done').length;
      
      const isCompleted = totalOps > 0 && completedOps === totalOps;
      
      if (!isCompleted && totalOps > 0) {
        let totalPairs = 0;
        
        if (article.type === 'sample') {
          try {
            const sp = JSON.parse(article.sizePairs || '[]');
            totalPairs = sp.reduce((acc: number, curr: any) => acc + (parseInt(curr.pairs, 10) || 0), 0);
          } catch(e) {}
        } else {
          totalPairs = parseInt(article.qty || '0', 10) || 0;
        }

        activeOrders.push({
          id: article.id,
          name: article.articleName,
          serial: article.serial,
          type: article.type, // 'sample' or 'bulk'
          totalPairs: totalPairs,
          operationsComplete: completedOps,
          operationsTotal: totalOps,
          createdAt: article.date,
        });
      }
    }

    return NextResponse.json({ activeOrders });
  } catch (error) {
    console.error("Gantt API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch gantt data' }, { status: 500 });
  }
}
