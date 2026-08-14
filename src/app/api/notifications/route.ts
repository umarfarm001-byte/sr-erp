import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'admin').toLowerCase();

    const isAdminOrDirector = role === 'admin' || role === 'director';

    const notifications: any[] = [];
    const now = new Date();
    const todayString = format(now, 'yyyy-MM-dd');
    const recentStart = subDays(now, 2);

    // Filter condition for operations based on role
    // Admins see all. Workers only see if operation name contains their role string.
    // e.g. role 'cutting' will see 'Upper Cutting'
    const opFilter = isAdminOrDirector ? {} : {
      name: { contains: role }
    };

    // 1. Overdue Operations (High Priority / Red)
    const overdueOps = await prisma.operation.findMany({
      where: {
        status: 'pending',
        targetDate: { lt: todayString, not: null },
        ...opFilter
      },
      include: { article: true },
      take: 15,
      orderBy: { targetDate: 'asc' }
    });

    overdueOps.forEach(op => {
      const daysOverdue = op.targetDate ? Math.floor((now.getTime() - new Date(op.targetDate).getTime()) / (1000 * 3600 * 24)) : 0;
      notifications.push({
        id: `overdue-${op.id}`,
        type: 'error',
        title: 'Overdue Operation',
        message: `${op.name} for ${op.article.articleName} is overdue by ${daysOverdue} days!`,
        timestamp: op.targetDate ? new Date(op.targetDate) : now,
        link: `/orders/${op.article.id}`
      });
    });

    // 2. Deadlines Today (Warning / Yellow)
    const todayOps = await prisma.operation.findMany({
      where: {
        status: 'pending',
        targetDate: todayString,
        ...opFilter
      },
      include: { article: true },
      take: 10
    });

    todayOps.forEach(op => {
      notifications.push({
        id: `today-${op.id}`,
        type: 'warning',
        title: 'Deadline Today',
        message: `${op.name} for ${op.article.articleName} is due today.`,
        timestamp: now,
        link: `/orders/${op.article.id}`
      });
    });

    // 3. New Orders (Info / Blue) - Only for Admins/Directors
    if (isAdminOrDirector) {
      const newArticles = await prisma.article.findMany({
        where: {
          date: { gte: recentStart }
        },
        take: 5,
        orderBy: { date: 'desc' }
      });

      newArticles.forEach(art => {
        notifications.push({
          id: `new-${art.id}`,
          type: 'info',
          title: 'New Order',
          message: `New ${art.type} order created: ${art.articleName}`,
          timestamp: art.date,
          link: `/orders/${art.id}`
        });
      });
    }

    const typeWeight: Record<string, number> = { error: 1, warning: 2, info: 3 };
    notifications.sort((a, b) => typeWeight[a.type] - typeWeight[b.type]);

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Notifications API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
