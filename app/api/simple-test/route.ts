import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple test without database
    return NextResponse.json({ 
      success: true, 
      message: "API is working",
      timestamp: new Date().toISOString()
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
