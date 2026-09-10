import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import jwt from "jsonwebtoken";

const QR_SECRET = process.env.QR_SECRET || 'smart-attend-qr-secret-2026-strong-key';

export async function POST(request: NextRequest) {
  try {
    const { token, userId: sessionUserId } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // تحقق من الـ token JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, QR_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      return NextResponse.json({ error: "QR منتهي الصلاحية أو غير صالح" }, { status: 401 });
    }

    if (decoded?.exp && decoded.exp < Date.now() / 1000) {
      return NextResponse.json({ error: "QR منتهي الصلاحية" }, { status: 401 });
    }

    // تحقق إذا كان token من الشاشة العامة (live-monitor)
    let dbToken = null;
    if (decoded.screen === 'live-monitor') {
      // Token من الشاشة العامة - لا يوجد تحقق في DB
      // ننتقل مباشرة للبحث عن الموظف
    } else {
      // Token من موظف - تحقق في قاعدة البيانات
      dbToken = await prisma.qrToken.findFirst({
        where: {
          token: token,
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!dbToken) {
        return NextResponse.json(
          {
            error: 'QR Code منتهي الصلاحية أو مستخدم مسبقاً، يرجى مسح QR جديد'
          },
          { status: 400 }
        );
      }
    }

    // ابحث عن الموظف بالـ email
    const employee = await prisma.employee.findUnique({
      where: { email: sessionUserId },
      include: { department: true }
    });

    if (!employee) {
      return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });
    }

    // تحقق من عدم التكرار خلال 5 دقائق
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentScan = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        timestamp: { gte: fiveMinutesAgo }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (recentScan) {
      return NextResponse.json({
        error: "يرجى الانتظار قليلاً قبل المسح مرة أخرى",
        lastScanTime: recentScan.timestamp
      }, { status: 429 });
    }

    // تحديد نوع الحضور IN/OUT
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        timestamp: { gte: today, lt: tomorrow }
      },
      orderBy: { timestamp: 'desc' }
    });

 if (lastAttendance && lastAttendance.type === 'OUT') {
  return NextResponse.json({
    error: "🎉 لقد أكملت يومك بنجاح! سجلت دخولاً وخروجاً اليوم.",
    type: "completed"
  }, { status: 429 });
}

const attendanceType = !lastAttendance ? 'IN' : 'OUT';

    // رسالة مختلفة لكل حالة
    const message = attendanceType === 'IN' 
      ? 'تم تسجيل الحضور بنجاح' 
      : 'تم تسجيل الخروج بنجاح';

    // تحديد الحالة LATE أو ON_TIME
    let attendanceStatus = 'ON_TIME';
    if (attendanceType === 'IN') {
      const workStart = new Date();
      workStart.setHours(9, 15, 0, 0); // 9:00 + 15 دقيقة grace
      if (new Date() > workStart) attendanceStatus = 'LATE';
    }

    // إنشاء سجل الحضور
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        timestamp: new Date(),
        type: attendanceType,
        status: attendanceStatus,
        date: new Date()
      },
      include: {
        employee: { include: { department: true } }
      }
    });

    // علّم الـ token كمستخدم فوراً (فقط إذا كان من موظف)
    if (dbToken) {
      await prisma.qrToken.update({
        where: { id: dbToken.id },
        data: { isUsed: true }
      });
    }

    return NextResponse.json({
      success: true,
      message,
      employeeName: attendance.employee.name,
      attendanceStatus,
      attendance: {
        id: attendance.id,
        type: attendanceType,
        status: attendanceStatus,
        time: format(new Date(attendance.timestamp), "HH:mm:ss", { locale: arEG }),
        date: format(new Date(attendance.timestamp), "yyyy-MM-dd")
      }
    });

  } catch (error) {
    console.error("QR Scanner Error:", error);
    return NextResponse.json({
      error: "خطأ في الخادم",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}