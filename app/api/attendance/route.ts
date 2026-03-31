import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

// GET - Fetch attendance records with status badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

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

    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
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

    // Add status badges and format data
    const formattedRecords = attendanceRecords.map(record => {
      const status = record.status || 'ON_TIME';
      let statusBadge = {
        text: 'في الوقت',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };

      switch (status) {
        case 'LATE':
          statusBadge = {
            text: 'متأخر',
            color: 'amber',
            bgColor: 'bg-amber-100',
            textColor: 'text-amber-800',
            borderColor: 'border-amber-200'
          };
          break;
        case 'EARLY_OUT':
          statusBadge = {
            text: 'خروج مبكر',
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200'
          };
          break;
        case 'OUT':
          statusBadge = {
            text: 'خروج',
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200'
          };
          break;
      }

      return {
        id: record.id,
        user: record.user,
        type: record.type,
        status: status,
        statusBadge,
        timestamp: record.timestamp,
        time: format(new Date(record.timestamp), "HH:mm:ss", { locale: arEG }),
        date: format(new Date(record.timestamp), "yyyy-MM-dd", { locale: arEG }),
        formattedDate: format(new Date(record.timestamp), "dd MMMM yyyy", { locale: arEG })
      };
    });

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      summary: {
        total: formattedRecords.length,
        onTime: formattedRecords.filter(r => r.status === 'ON_TIME').length,
        late: formattedRecords.filter(r => r.status === 'LATE').length,
        out: formattedRecords.filter(r => r.type === 'OUT').length
      }
    });

  } catch (error) {
    console.error('Failed to fetch attendance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

// POST - Export attendance data
export async function POST(request: NextRequest) {
  try {
    const { format: exportFormat, date, userId } = await request.json();

    // Fetch attendance data
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

    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: {
              select: {
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

    // Get company settings for header
    const companySettings = await prisma.companySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const companyName = companySettings?.companyName || 'شركة الاتحاد';

    if (exportFormat === 'csv') {
      // Generate CSV
      const headers = [
        'اسم الموظف',
        'البريد الإلكتروني',
        'القسم',
        'التاريخ',
        'الوقت',
        'نوع الحضور',
        'الحالة'
      ];

      const csvRows = [
        [companyName],
        [`تقرير الحضور - ${format(targetDate, "dd/MM/yyyy", { locale: arEG })}`],
        [], // Empty row
        headers,
        ...attendanceRecords.map(record => [
          record.user.name,
          record.user.email,
          record.user.department?.name || 'غير محدد',
          format(new Date(record.timestamp), "dd/MM/yyyy", { locale: arEG }),
          format(new Date(record.timestamp), "HH:mm:ss", { locale: arEG }),
          record.type === 'IN' ? 'دخول' : 'خروج',
          record.status === 'ON_TIME' ? 'في الوقت' : 
          record.status === 'LATE' ? 'متأخر' : 
          record.status === 'EARLY_OUT' ? 'خروج مبكر' : 'غير محدد'
        ])
      ];

      const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      // Add UTF-8 BOM for proper Arabic support in Excel
      const bom = '\ufeff';
      const csvWithBom = bom + csvContent;

      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="attendance-${format(targetDate, "yyyy-MM-dd")}.csv"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Unsupported export format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Failed to export attendance:', error);
    return NextResponse.json(
      { error: 'Failed to export attendance' },
      { status: 500 }
    );
  }
}
