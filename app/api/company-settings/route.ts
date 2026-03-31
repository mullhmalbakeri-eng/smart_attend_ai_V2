import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to fetch company settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Company Settings API - Updating settings:', data);

    // Check if settings exist
    const existingSettings = await prisma.companySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          companyName: data.companyName,
          logoUrl: data.logoUrl || null,
          workStartTime: data.workStartTime,
          workEndTime: data.workEndTime,
          gracePeriodMinutes: data.gracePeriodMinutes,
        }
      });
    } else {
      // Create new settings
      settings = await prisma.companySettings.create({
        data: {
          companyName: data.companyName,
          logoUrl: data.logoUrl || null,
          workStartTime: data.workStartTime,
          workEndTime: data.workEndTime,
          gracePeriodMinutes: data.gracePeriodMinutes,
        }
      });
    }

    console.log('Company Settings API - Settings updated:', settings);
    
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings
    });

  } catch (error) {
    console.error('Failed to save company settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
