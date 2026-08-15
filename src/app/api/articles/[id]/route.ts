import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to extract material names from JSON strings and save to MasterMaterial
async function saveMaterialSuggestions(fields: { [category: string]: any }) {
  const toUpsert: { name: string, category: string }[] = [];
  
  for (const [category, jsonString] of Object.entries(fields)) {
    if (!jsonString) continue;
    try {
      const parsed = JSON.parse(jsonString as string);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.name && typeof item.name === 'string' && item.name.trim() !== '') {
            toUpsert.push({ name: item.name.trim(), category });
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  const uniqueList = Array.from(new Set(toUpsert.map(u => JSON.stringify(u)))).map(s => JSON.parse(s));

  for (const item of uniqueList) {
    try {
      await prisma.masterMaterial.upsert({
        where: {
          category_name: {
            category: item.category,
            name: item.name
          }
        },
        update: {},
        create: {
          category: item.category,
          name: item.name
        }
      });
    } catch (e) {
      console.error("Failed to upsert material suggestion:", e);
    }
  }
}

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

    // Save material suggestions in background
    saveMaterialSuggestions({
      'Leather Material': data.upperMaterials,
      'Lining Material': data.liningMaterials,
      'Extra Material': data.extraMaterials,
      'Logo/Labels': data.logoLabels,
      'D-Ring / Hooks': data.dringHooks,
      'Laces & TPU': data.lacesTpu,
      'Threads': data.threads,
      'Insole': data.insole,
      'Toe Cap / Counter': data.toeCap,
      'Last': data.last,
      'Mould': data.mould,
      'Packing': data.packing
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
              assignedUserId: step.assignedUserId || \`default_\${step.dept.toLowerCase()}\`,
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
