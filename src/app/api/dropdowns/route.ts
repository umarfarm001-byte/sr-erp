import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.masterCustomer.findMany({ select: { name: true } });
    const articleCodes = await prisma.masterArticleCode.findMany({ select: { code: true } });
    const lasts = await prisma.masterLast.findMany({ select: { name: true } });
    const materials = await prisma.masterMaterial.findMany({ select: { name: true, category: true } });

    // Group materials by category
    const groupedMaterials: Record<string, string[]> = {};
    materials.forEach((m: any) => {
      if (!groupedMaterials[m.category]) groupedMaterials[m.category] = [];
      groupedMaterials[m.category].push(m.name);
    });

    return NextResponse.json({
      customers: customers.map((c: any) => c.name),
      articleCodes: articleCodes.map((a: any) => a.code),
      lasts: lasts.map((l: any) => l.name),
      materials: groupedMaterials
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const value = searchParams.get('value');
    
    if (!type || !value) return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });

    if (type === 'customer') {
      await prisma.masterCustomer.deleteMany({ where: { name: value } });
    } else if (type === 'articleCode') {
      await prisma.masterArticleCode.deleteMany({ where: { code: value } });
    } else if (type === 'Last') {
      await prisma.masterLast.deleteMany({ where: { name: value } });
    } else {
      // It's a material category
      await prisma.masterMaterial.deleteMany({ where: { category: type, name: value } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, value } = await request.json();
    if (!type || !value) return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    
    if (type === 'customer') {
      const exists = await prisma.masterCustomer.findUnique({ where: { name: value } });
      if (!exists) await prisma.masterCustomer.create({ data: { name: value } });
    } else if (type === 'articleCode') {
      const exists = await prisma.masterArticleCode.findUnique({ where: { code: value } });
      if (!exists) await prisma.masterArticleCode.create({ data: { code: value } });
    } else if (type === 'Last') {
      const exists = await prisma.masterLast.findUnique({ where: { name: value } });
      if (!exists) await prisma.masterLast.create({ data: { name: value } });
    } else {
      // It's a material category
      const exists = await prisma.masterMaterial.findFirst({ where: { category: type, name: value } });
      if (!exists) await prisma.masterMaterial.create({ data: { category: type, name: value } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
