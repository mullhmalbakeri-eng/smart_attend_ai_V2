import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch real-time attendance stats from database
    const totalEmployees = await prisma.user.count();
    
    const presentToday = await prisma.attendance.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: today
        },
        type: 'IN'
      }
    }).then(result => result.length);
    
    // Get present user IDs
    const presentUserIds = await prisma.attendance.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: today
        },
        type: 'IN'
      }
    }).then(result => result.map(r => r.userId));
    
    const absentToday = await prisma.user.count({
      where: {
        id: {
          notIn: presentUserIds
        }
      }
    });
    
    const lateToday = await prisma.attendance.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0, 0)
        },
        type: 'IN'
      }
    }).then(result => result.length);
    
    const recentCheckIns = await prisma.attendance.findMany({
      where: {
        timestamp: {
          gte: today
        }
      },
      include: {
        user: {
          include: {
            department: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    const stats = {
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      recentCheckIns: recentCheckIns.map((record: any) => ({
        id: record.id,
        userName: record.user.name,
        department: record.user.department?.name || 'Unknown',
        time: record.timestamp.toLocaleTimeString('ar-EG', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: record.type
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Attendance stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance stats" },
      { status: 500 }
    );
  }
}
