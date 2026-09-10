import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Creating test employees...');

    // Get or create default department
    let defaultDept = await prisma.department.findFirst();
    if (!defaultDept) {
      defaultDept = await prisma.department.create({
        data: { name: 'الإدارة' }
      });
    }
    const departmentId = defaultDept.id;

    // Create Admin Employee
    const adminData = {
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN',
      name: 'Administrator',
      departmentId: departmentId
    };

    const existingAdmin = await prisma.employee.findUnique({
      where: { email: adminData.email }
    });

    let admin = existingAdmin;
    if (!existingAdmin) {
      admin = await prisma.employee.create({ data: adminData });
      console.log('Admin employee created:', admin.email);
    } else {
      admin = await prisma.employee.update({
        where: { email: adminData.email },
        data: {
          password: adminData.password,
          role: adminData.role,
          name: adminData.name
        }
      });
      console.log('Admin employee updated:', admin.email);
    }

    // Create Test Employee
    const employeeData = {
      email: 'employee@test.com',
      password: '123456',
      role: 'EMPLOYEE',
      name: 'Test Employee',
      departmentId: departmentId
    };

    const existingEmployee = await prisma.employee.findUnique({
      where: { email: employeeData.email }
    });

    let employee = existingEmployee;
    if (!existingEmployee) {
      employee = await prisma.employee.create({ data: employeeData });
      console.log('Employee created:', employee.email);
    } else {
      employee = await prisma.employee.update({
        where: { email: employeeData.email },
        data: {
          password: employeeData.password,
          role: employeeData.role,
          name: employeeData.name
        }
      });
      console.log('Employee updated:', employee.email);
    }

    return NextResponse.json({
      success: true,
      message: 'Test employees created/updated',
      users: [
        { email: admin.email, name: admin.name, role: admin.role, password: '123456' },
        { email: employee.email, name: employee.name, role: employee.role, password: '123456' }
      ]
    });

  } catch (error) {
    console.error('Create Test Users API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create test users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.employee.findMany({
      where: {
        email: {
          in: ['admin@test.com', 'employee@test.com']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('List Test Users API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to list test users'
    }, { status: 500 });
  }
}
