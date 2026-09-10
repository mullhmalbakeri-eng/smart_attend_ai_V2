import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEmployees, presentTodayResult, activeDepartments, recentCheckIns] =
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
        prisma.attendance.findMany({
          where: { timestamp: { gte: today } },
          orderBy: { timestamp: 'desc' },
          take: 10,
          include: {
            employee: {
              include: { department: true }
            }
          }
        }),
      ]);

    const lateToday = recentCheckIns.filter(r => r.status === 'LATE').length;
    const presentToday = presentTodayResult.length;
    const absentToday = Math.max(0, totalEmployees - presentToday);

    return NextResponse.json({
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      activeDepartments,
      recentCheckIns: recentCheckIns.map(r => ({
        id: String(r.id),
        userName: r.employee?.name || 'غير معروف',
        department: r.employee?.department?.name || '',
        time: new Date(r.timestamp).toLocaleTimeString('ar-SA'),
        type: r.type,
        status: r.status
      }))
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}