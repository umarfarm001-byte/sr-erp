import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let profile = await prisma.companyRecord.findUnique({
      where: { id: 'default' }
    });

    if (!profile) {
      profile = await prisma.companyRecord.create({
        data: {
          id: 'default',
          name: 'SR Footwear'
        }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to get company profile:', error);
    return NextResponse.json({ error: 'Failed to get company profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const profile = await prisma.companyRecord.upsert({
      where: { id: 'default' },
      update: {
        name: data.name,
        address: data.address,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        gstNumber: data.gstNumber
      },
      create: {
        id: 'default',
        name: data.name || 'SR Footwear',
        address: data.address,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        gstNumber: data.gstNumber
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to update company profile:', error);
    return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
  }
}
