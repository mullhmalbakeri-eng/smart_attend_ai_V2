import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId"); // ✅ Fixed: was userId

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereClause: Record<string, unknown> = {
      timestamp: { gte: targetDate, lt: nextDay },
    };

    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId); // ✅ Fixed: was userId
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {                   // ✅ Fixed: was `user`
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    const statusBadgeMap: Record<string, object> = {
      ON_TIME: { text: "في الوقت", color: "green", bgColor: "bg-green-100", textColor: "text-green-800", borderColor: "border-green-200" },
      LATE:    { text: "متأخر",    color: "amber", bgColor: "bg-amber-100",  textColor: "text-amber-800",  borderColor: "border-amber-200" },
      EARLY_OUT: { text: "خروج مبكر", color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-800", borderColor: "border-blue-200" },
      OUT:     { text: "خروج",     color: "blue",  bgColor: "bg-blue-100",  textColor: "text-blue-800",  borderColor: "border-blue-200" },
    };

    const formattedRecords = records.map(record => ({
      id: record.id,
      employee: record.employee,        // ✅ Fixed: was user
      employeeId: record.employeeId,    // ✅ Fixed: was userId
      type: record.type,
      status: record.status ?? "ON_TIME",
      statusBadge: statusBadgeMap[record.status ?? "ON_TIME"] ?? statusBadgeMap.ON_TIME,
      timestamp: record.timestamp,
      time: format(new Date(record.timestamp), "HH:mm:ss", { locale: arEG }),
      date: format(new Date(record.timestamp), "yyyy-MM-dd"),
      formattedDate: format(new Date(record.timestamp), "dd MMMM yyyy", { locale: arEG }),
    }));

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      summary: {
        total: formattedRecords.length,
        onTime: formattedRecords.filter(r => r.status === "ON_TIME").length,
        late: formattedRecords.filter(r => r.status === "LATE").length,
        out: formattedRecords.filter(r => r.type === "OUT").length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { format: exportFormat, date, employeeId } = await request.json(); // ✅ Fixed: was userId

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereClause: Record<string, unknown> = {
      timestamp: { gte: targetDate, lt: nextDay },
    };

    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId); // ✅ Fixed
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {                    // ✅ Fixed: was user
          select: {
            name: true,
            email: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    const companySettings = await prisma.companySettings.findFirst({ orderBy: { createdAt: "desc" } });
    const companyName = companySettings?.companyName ?? "شركة الاتحاد";

    if (exportFormat === "csv") {
      const headers = ["اسم الموظف", "البريد الإلكتروني", "القسم", "التاريخ", "الوقت", "نوع الحضور", "الحالة"];
      const csvRows = [
        [companyName],
        [`تقرير الحضور - ${format(targetDate, "dd/MM/yyyy", { locale: arEG })}`],
        [],
        headers,
        ...records.map(r => [
          r.employee.name,
          r.employee.email,
          r.employee.department?.name ?? "غير محدد",
          format(new Date(r.timestamp), "dd/MM/yyyy", { locale: arEG }),
          format(new Date(r.timestamp), "HH:mm:ss", { locale: arEG }),
          r.type === "IN" ? "دخول" : "خروج",
          r.status === "ON_TIME" ? "في الوقت" : r.status === "LATE" ? "متأخر" : r.status === "EARLY_OUT" ? "خروج مبكر" : "غير محدد",
        ]),
      ];

      const csv = "\ufeff" + csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="attendance-${format(targetDate, "yyyy-MM-dd")}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported export format" }, { status: 400 });
  } catch (error) {
    console.error("Failed to export attendance:", error);
    return NextResponse.json({ error: "Failed to export attendance" }, { status: 500 });
  }
}
