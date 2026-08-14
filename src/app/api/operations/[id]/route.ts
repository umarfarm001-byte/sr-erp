import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: opId } = await params;
    const body = await request.json();
    
    const operation = await prisma.operation.findUnique({
      where: { id: opId }
    });

    if (!operation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.action === 'set_date') {
      await prisma.operation.update({
        where: { id: opId },
        data: { targetDate: body.targetDate, status: 'in_progress' }
      });
      return NextResponse.json({ success: true });
    }
    if (body.action === 'upload_photos') {
      await prisma.operation.update({
        where: { id: opId },
        data: { photos: body.photos }
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'complete') {
      await prisma.operation.update({
        where: { id: opId },
        data: { status: 'done', completedDate: body.completedDate, remarks: body.remarks, photos: body.photos }
      });

      // TIMELINE ENGINE: Auto-shift downstream targets if late
      const targetStr = operation.targetDate;
      const completeStr = body.completedDate;
      
      if (targetStr && completeStr) {
        const targetDate = new Date(targetStr);
        const completeDate = new Date(completeStr);
        
        if (completeDate > targetDate) {
          const diffTime = Math.abs(completeDate.getTime() - targetDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Get all subsequent operations that have target dates set
          const downstreamOps = await prisma.operation.findMany({
            where: {
              articleId: operation.articleId,
              opId: { gt: operation.opId },
              targetDate: { not: null }
            }
          });
          
          // Shift them by diffDays
          for (const downstreamOp of downstreamOps) {
            const oldTarget = new Date(downstreamOp.targetDate!);
            oldTarget.setDate(oldTarget.getDate() + diffDays);
            const newTargetStr = oldTarget.toISOString().split('T')[0];
            
            await prisma.operation.update({
              where: { id: downstreamOp.id },
              data: { targetDate: newTargetStr }
            });
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating operation:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}
