import { NextResponse } from "next/server";
import { generateQRToken } from "@/lib/qr-engine";

export async function GET() {
  try {
    // Generate a new QR token
    const token = generateQRToken('current-user');
    
    // Return token with no caching headers
    return new NextResponse(
      JSON.stringify({ token }),
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
