import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Using a whitelist of fields that can be patched directly
    const data: any = {};
    const updatableFields = [
      'party', 'articleName', 'qty', 'deliveryDate',
      'extraMaterials', 'pattern', 'upperMaterials', 
      'liningMaterials', 'logoLabels', 'dringHooks', 
      'lacesTpu', 'threads', 'insole', 'toeCap', 'last', 'mould', 'packing',
      'photos', 'sizePairs', 'sizeSystem', 'sampleType'
    ];
    
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data
    });

    if (body.selectedSteps && Array.isArray(body.selectedSteps)) {
      const existingOps = await prisma.operation.findMany({ where: { articleId: id } });
      const newOpIds = body.selectedSteps.map((s: any) => s.opId);

      // Delete ops not in selectedSteps
      for (const op of existingOps) {
        if (!newOpIds.includes(op.opId)) {
          await prisma.operation.delete({ where: { id: op.id } });
        }
      }

      // Create or update ops
      for (const step of body.selectedSteps) {
        const existingOp = existingOps.find(o => o.opId === step.opId);
        if (existingOp) {
          if (existingOp.assignedUserId !== step.assignedUserId || existingOp.customRole !== step.dept) {
            await prisma.operation.update({
              where: { id: existingOp.id },
              data: { assignedUserId: step.assignedUserId, customRole: step.dept }
            });
          }
        } else {
          await prisma.operation.create({
            data: {
              opId: step.opId,
              name: step.name,
              customRole: step.dept,
              assignedUserId: step.assignedUserId || `default_${step.dept.toLowerCase()}`,
              articleId: id,
              status: "pending"
            }
          });
        }
      }
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Article PATCH Error:", error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article DELETE Error:", error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
