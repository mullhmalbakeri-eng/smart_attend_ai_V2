import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Auth API is working",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "POST /api/auth/login - User login",
      "POST /api/auth/logout - User logout",
      "GET /api/auth/me - Get current user"
    ]
  });
}
