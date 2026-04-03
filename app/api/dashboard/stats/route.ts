import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEmployees, presentTodayResult, activeDepartments, attendanceToday] =
      await Promise.all([
        prisma.employee.count(),
        prisma.attendance.findMany({
          where: { timestamp: { gte: today }, type: "IN" },
          select: { employeeId: true },
          distinct: ["employeeId"],
        }),
        prisma.department.count({
          where: { employees: { some: {} } },
        }),
        prisma.attendance.count({
          where: { timestamp: { gte: today } },
        }),
      ]);

    return NextResponse.json({
      totalEmployees,
      presentToday: presentTodayResult.length,
      activeDepartments,
      attendanceToday,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
