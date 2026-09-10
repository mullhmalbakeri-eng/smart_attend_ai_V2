import { NextResponse } from "next/server";
import { generateQRToken } from "@/lib/qr-engine";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'smart-attend-qr-secret-2026-strong-key';

// GET endpoint for live monitor screen (public token)
export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      { screen: 'live-monitor', iat: now, exp: now + 30 },
      QR_SECRET,
      { algorithm: 'HS256' }
    );
    return NextResponse.json({ success: true, token });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Invalidate all old tokens for this employee
    await prisma.qrToken.updateMany({
      where: {
        employeeId: employeeId,
        isUsed: false
      },
      data: {
        isUsed: true
      }
    });

    // Generate a new QR token
    const token = await generateQRToken(employeeId);
    
    // Return token with no caching headers
    return NextResponse.json(
      { success: true, token },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
