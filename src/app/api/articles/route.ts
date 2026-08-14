import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      serial, party, articleName, type, isBulkProd, selectedSteps,
      sampleType, pattern, sizeSystem, sizePairs, upperMaterials, liningMaterials, 
      logoLabels, dringHooks, lacesTpu, threads, insole, toeCap, last, mould, 
      injectionDetails, packing, photos,
      qty, deliveryDate, remarks, linkedArticleId
    } = body;
    
    // Create the article
    const article = await prisma.article.create({
      data: {
        serial,
        party,
        articleName,
        type, // 'sample' or 'bulk'
        isBulkProd,
        sampleType,
        pattern,
        sizeSystem,
        sizePairs,
        upperMaterials,
        liningMaterials,
        logoLabels,
        dringHooks,
        lacesTpu,
        threads,
        insole,
        toeCap,
        last,
        mould,
        injectionDetails,
        packing,
        photos,
        qty,
        deliveryDate,
        remarks,
        linkedArticleId
      }
    });

    if (selectedSteps && selectedSteps.length > 0) {
      const operationsData = selectedSteps.map((step: any) => ({
        opId: step.opId,
        name: step.name,
        customRole: step.dept,
        assignedUserId: step.assignedUserId || `default_${step.dept.toLowerCase()}`,
        articleId: article.id,
        status: "pending"
      }));

      await prisma.operation.createMany({
        data: operationsData
      });
    }

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 });
  }
}
