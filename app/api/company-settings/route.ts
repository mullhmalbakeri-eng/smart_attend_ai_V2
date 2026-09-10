import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(
      { settings }, 
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('Failed to fetch company settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Company Settings API - Updating settings:', data);

    // Check if user has admin permissions (you might want to add proper auth here)
    // For now, we'll proceed without auth check as requested

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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Failed to save company settings:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
