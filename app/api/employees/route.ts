import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// جلب الموظفين
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true }
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.log("DETAILED PRISMA ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// إضافة موظف جديد
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password || '123456',
        role: body.role || 'EMPLOYEE',
        departmentId: body.departmentId,
      }
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.log("DETAILED PRISMA ERROR:", error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
