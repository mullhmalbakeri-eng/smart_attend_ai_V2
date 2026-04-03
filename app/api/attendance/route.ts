import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

const prisma = new PrismaClient();

// GET - Fetch attendance records with status badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');

    // If date is provided, filter by that date, otherwise use today
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereClause: any = {
      timestamp: {
        gte: targetDate,
        lt: nextDay
      }
    };

    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId);
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { 
            id: true,
            name: true, 
            email: true, 
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Transform data to match expected format
    const records = attendances.map(record => ({
      id: record.id,
      employeeId: record.employeeId,
      employee: record.employee,
      timestamp: record.timestamp,
      type: record.type,
      status: record.status,
      date: format(new Date(record.timestamp), 'yyyy-MM-dd', { locale: arEG }),
      time: format(new Date(record.timestamp), 'HH:mm:ss', { locale: arEG })
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

// POST - Create attendance record
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
            id: true,
            name: true, 
            email: true, 
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}
