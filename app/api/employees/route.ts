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
    const data = await req.json();
    console.log("Incoming Data:", data);
    const departmentId = Number(data.departmentId);
    if (!data?.name || !data?.email || !departmentId) {
      return NextResponse.json(
        { error: "name, email, and departmentId are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || '123456',
        role: data.role || 'EMPLOYEE',
        departmentId,
      },
      include: { department: true }
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    console.log("DETAILED PRISMA ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// تعديل موظف
export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    console.log("Incoming Data:", data);
    const id = Number(data.id);
    const departmentId = Number(data.departmentId);
    if (!id || !data?.name || !data?.email || !departmentId) {
      return NextResponse.json(
        { error: "id, name, email, and departmentId are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role || 'EMPLOYEE',
        departmentId,
        ...(data.password ? { password: data.password } : {}),
      },
      include: { department: true }
    });

    return NextResponse.json(employee, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.log("DETAILED PRISMA ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// حذف موظف
export async function DELETE(req: Request) {
  try {
    const data = await req.json();
    const id = Number(data.id);
    
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.delete({
      where: { id },
      include: { department: true }
    });

    return NextResponse.json(employee, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.log("DETAILED PRISMA ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
