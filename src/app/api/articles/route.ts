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
      // Ignore JSON parse errors
    }
  }

  // Deduplicate in memory first
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
      injectionDetails, packing, photos, extraMaterials,
      qty, deliveryDate, remarks, linkedArticleId
    } = body;
    
    // Create the article
    const article = await prisma.article.create({
      data: {
        serial, party, articleName, type, isBulkProd, sampleType, pattern, sizeSystem, sizePairs,
        upperMaterials, liningMaterials, logoLabels, dringHooks, lacesTpu, threads, insole, toeCap,
        last, mould, injectionDetails, packing, photos, extraMaterials,
        qty, deliveryDate, remarks, linkedArticleId
      }
    });

    // Save materials in background (don't block the response for too long)
    saveMaterialSuggestions({
      'Leather Material': upperMaterials,
      'Lining Material': liningMaterials,
      'Extra Material': extraMaterials,
      'Logo/Labels': logoLabels,
      'D-Ring / Hooks': dringHooks,
      'Laces & TPU': lacesTpu,
      'Threads': threads,
      'Insole': insole,
      'Toe Cap / Counter': toeCap,
      'Last': last,
      'Mould': mould,
      'Packing': packing
    });

    if (selectedSteps && selectedSteps.length > 0) {
      const operationsData = selectedSteps.map((step: any) => ({
        opId: step.opId,
        name: step.name,
        customRole: step.dept,
        assignedUserId: step.assignedUserId || \`default_\${step.dept.toLowerCase()}\`,
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
