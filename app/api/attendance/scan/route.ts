import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import jwt from "jsonwebtoken";
import { QRTokenPayload } from "@/lib/qr-engine";

const QR_SECRET = process.env.QR_SECRET || 'smart-attend-qr-secret-2024-strong-key';

export async function POST(request: NextRequest) {
  try {
    const { token, userId: sessionUserId } = await request.json();
    
    console.log('QR Scan API - Request received:', { token, sessionUserId });

    if (!token) {
      console.log('QR Scan API - Token missing');
      return NextResponse.json({ 
        error: "Token is required" 
      }, { status: 400 });
    }

    // First decrypt the incoming token using jwt.verify
    let decoded: QRTokenPayload;
    try {
      decoded = jwt.verify(token, QR_SECRET, {
        algorithms: ['HS256']
      }) as QRTokenPayload;
      console.log('QR Scan API - Token decoded:', decoded);
    } catch (error) {
      console.log('QR Scan API - Token verification failed:', error);
      // If it fails, return a clear error
      return NextResponse.json({
        error: "Expired or Invalid QR"
      }, { status: 401 });
    }

    // Check if token is still valid (not expired)
    if (decoded && decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('QR Scan API - Token expired');
      return NextResponse.json({
        error: "Expired QR Code"
      }, { status: 401 });
    }

    // Get employee information
    console.log('QR Scan API - Looking for user with email:', sessionUserId);
    const employee = await prisma.user.findUnique({
      where: { email: sessionUserId }, // Use email instead of ID
      include: { department: true }
    });

    console.log('QR Scan API - Employee found:', employee ? employee.email : 'Not found');

    if (!employee) {
      console.log('QR Scan API - Employee not found');
      return NextResponse.json({
        error: "Employee not found"
      }, { status: 404 });
    }

    // Use the actual database user ID for attendance
    const actualUserId = employee.id;
    console.log('QR Scan API - Using actual user ID:', actualUserId);

    // Check for duplicate scan within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentScan = await prisma.attendance.findFirst({
      where: {
        userId: actualUserId,
        timestamp: {
          gte: fiveMinutesAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (recentScan) {
      console.log('QR Scan API - Duplicate scan detected:', recentScan.timestamp);
      return NextResponse.json({
        error: "يرجى الانتظار قليلاً قبل المسح مرة أخرى",
        lastScanTime: recentScan.timestamp
      }, { status: 429 });
    }

    // Get company settings for late detection
    const companySettings = await prisma.companySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const workStartTime = companySettings?.workStartTime || "09:00";
    const gracePeriodMinutes = companySettings?.gracePeriodMinutes || 15;
    
    console.log('QR Scan API - Company settings:', { workStartTime, gracePeriodMinutes });

    // Check if user already has attendance today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastAttendance = await prisma.attendance.findFirst({
      where: {
        userId: actualUserId, // Use actual user ID
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Determine attendance type (IN/OUT) and status (ON_TIME/LATE)
    let attendanceType: 'IN' | 'OUT';
    let attendanceStatus: 'ON_TIME' | 'LATE' | 'EARLY_OUT';
    
    if (!lastAttendance || lastAttendance.type === 'OUT') {
      attendanceType = 'IN';
      
      // Check if user is late for IN scan
      const currentTime = new Date();
      const [workHours, workMinutes] = workStartTime.split(':').map(Number);
      const workStartToday = new Date(currentTime);
      workStartToday.setHours(workHours, workMinutes, 0, 0);
      
      const gracePeriodEnd = new Date(workStartToday);
      gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + gracePeriodMinutes);
      
      if (currentTime > gracePeriodEnd) {
        attendanceStatus = 'LATE';
      } else {
        attendanceStatus = 'ON_TIME';
      }
    } else {
      attendanceType = 'OUT';
      attendanceStatus = 'ON_TIME'; // For simplicity, all OUT scans are ON_TIME
    }

    console.log('QR Scan API - Attendance type:', attendanceType, 'Status:', attendanceStatus);
    console.log('QR Scan API - Creating attendance record...');

    // Create attendance record with actual user ID from session
    const attendance = await prisma.attendance.create({
      data: {
        userId: actualUserId, // Use the actual database user ID
        timestamp: new Date(),
        type: attendanceType,
        status: attendanceStatus
      },
      include: {
        user: { 
          include: { department: true } 
        }
      }
    });

    console.log('QR Scan API - Attendance created:', attendance.id);

    // Return success with employee's name
    return NextResponse.json({
      success: true,
      message: attendanceStatus === 'LATE' ? "Attendance recorded (Late arrival)" : "Attendance recorded successfully",
      employeeName: attendance.user.name,
      attendanceStatus: attendanceStatus,
      attendance: {
        id: attendance.id,
        type: attendanceType,
        status: attendanceStatus,
        time: format(new Date(attendance.timestamp), "HH:mm:ss", { locale: arEG }),
        date: format(new Date(attendance.timestamp), "yyyy-MM-dd", { locale: arEG })
      }
    });

  } catch (error) {
    console.error("QR Scanner API Error:", error);
    console.error("QR Scanner API Error Stack:", error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
