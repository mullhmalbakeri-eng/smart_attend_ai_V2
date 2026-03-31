import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch real statistics from database
    const [
      totalEmployees,
      presentToday,
      activeDepartments,
      attendanceToday
    ] = await Promise.all([
      // Total employees count
      prisma.user.count(),
      
      // Present today count (employees who checked in today)
      prisma.attendance.groupBy({
        by: ['userId'],
        where: {
          timestamp: {
            gte: today
          },
          type: 'IN'
        }
      }).then(result => result.length),
      
      // Active departments count
      prisma.department.count({
        where: {
          users: {
            some: {}
          }
        }
      }),
      
      // Total attendance records today
      prisma.attendance.count({
        where: {
          timestamp: {
            gte: today
          }
        }
      })
    ]);

    const stats = {
      totalEmployees,
      presentToday,
      activeDepartments,
      attendanceToday
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
