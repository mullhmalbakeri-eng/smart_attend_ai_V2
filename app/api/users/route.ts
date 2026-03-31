import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock data - replace with actual Prisma query
    const users = [
      { id: 1, name: "أحمد محمد", email: "ahmed@example.com", department: "IT", phone: "0501234567" },
      { id: 2, name: "فاطمة علي", email: "fatima@example.com", department: "HR", phone: "0507654321" },
      { id: 3, name: "محمد سالم", email: "mohammed@example.com", department: "Finance", phone: "0509876543" },
      { id: 4, name: "عبدالله خالد", email: "abdullah@example.com", department: "IT", phone: "0501111111" },
      { id: 5, name: "مريم أحمد", email: "mariam@example.com", department: "Marketing", phone: "0502222222" },
      { id: 6, name: "يوسف عمر", email: "yousef@example.com", department: "Sales", phone: "0503333333" },
      { id: 7, name: "نورة سعيد", email: "noura@example.com", department: "HR", phone: "0504444444" },
      { id: 8, name: "خالد حسن", email: "khalid@example.com", department: "IT", phone: "0505555555" },
      { id: 9, name: "ليلى محمد", email: "laila@example.com", department: "Finance", phone: "0506666666" },
      { id: 10, name: "عمر علي", email: "omar@example.com", department: "Operations", phone: "0507777777" },
    ];

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
