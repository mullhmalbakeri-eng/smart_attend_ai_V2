import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock data - replace with actual Prisma query
    const attendance = [
      { id: 1, userId: 1, userName: "أحمد محمد", department: "IT", type: "In", time: "09:00" },
      { id: 2, userId: 2, userName: "فاطمة علي", department: "HR", type: "In", time: "08:45" },
      { id: 3, userId: 3, userName: "محمد سالم", department: "Finance", type: "In", time: "09:15" },
    ];

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
