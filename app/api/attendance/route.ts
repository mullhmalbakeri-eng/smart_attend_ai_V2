import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereClause: any = {
      timestamp: { gte: targetDate, lt: nextDay }
    };

    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId);
    }

    const [attendances, totalEmployees] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true, name: true, email: true,
              department: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.employee.count()
    ]);

    const records = attendances.map(record => ({
      id: record.id,
      employeeId: record.employeeId,
      user: {
        id: record.employee.id,
        name: record.employee.name,
        email: record.employee.email,
        department: record.employee.department
      },
      timestamp: record.timestamp,
      type: record.type,
      status: record.status,
      date: format(new Date(record.timestamp), 'yyyy-MM-dd', { locale: arEG }),
      time: format(new Date(record.timestamp), 'HH:mm:ss', { locale: arEG }),
      formattedDate: format(new Date(record.timestamp), 'dd/MM/yyyy', { locale: arEG }),
      statusBadge: {
        text: record.status === 'ON_TIME' ? 'في الوقت' : record.status === 'LATE' ? 'متأخر' : 'خروج',
        color: 'green', bgColor: '', textColor: '', borderColor: ''
      }
    }));

    const presentIds = new Set(records.filter(r => r.type === 'IN').map(r => r.employeeId));

    const summary = {
      total: records.length,
      onTime: records.filter(r => r.status === 'ON_TIME').length,
      late: records.filter(r => r.status === 'LATE').length,
      out: records.filter(r => r.type === 'OUT').length,
      absent: Math.max(0, totalEmployees - presentIds.size)
    };

    return NextResponse.json({ records, summary });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, type, status } = body;

    if (!employeeId || !type) {
      return NextResponse.json(
        { error: 'Employee ID and type are required' },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parseInt(employeeId),
        type: type as 'IN' | 'OUT',
        status: status || 'ON_TIME',
        date: new Date()
      },
      include: {
        employee: {
          select: {
            id: true, name: true, email: true,
            department: { select: { id: true, name: true } }
          }
        }
      }
    });

    return NextResponse.json({
      ...attendance,
      user: {
        id: attendance.employee.id,
        name: attendance.employee.name,
        email: attendance.employee.email,
        department: attendance.employee.department
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}
