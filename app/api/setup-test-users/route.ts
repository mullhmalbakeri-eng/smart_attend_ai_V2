import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Creating all test users...');

    // Create Admin User
    const adminData = {
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN' as const,
      name: 'Administrator',
      uuid: 'admin-uuid-' + Date.now()
    };

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    let admin = existingAdmin;
    if (!existingAdmin) {
      admin = await prisma.user.create({
        data: adminData
      });
      console.log('Admin user created:', admin.email);
    } else {
      admin = await prisma.user.update({
        where: { email: adminData.email },
        data: {
          password: adminData.password,
          role: adminData.role,
          name: adminData.name
        }
      });
      console.log('Admin user updated:', admin.email);
    }

    // Create Employee User
    const employeeData = {
      email: 'employee@test.com',
      password: '123456',
      role: 'EMPLOYEE' as const,
      name: 'Test Employee',
      uuid: 'employee-uuid-' + Date.now()
    };

    const existingEmployee = await prisma.user.findUnique({
      where: { email: employeeData.email }
    });

    let employee = existingEmployee;
    if (!existingEmployee) {
      employee = await prisma.user.create({
        data: employeeData
      });
      console.log('Employee user created:', employee.email);
    } else {
      employee = await prisma.user.update({
        where: { email: employeeData.email },
        data: {
          password: employeeData.password,
          role: employeeData.role,
          name: employeeData.name
        }
      });
      console.log('Employee user updated:', employee.email);
    }

    return NextResponse.json({
      success: true,
      message: 'Test users created/updated successfully',
      users: [
        {
          email: admin.email,
          name: admin.name,
          role: admin.role,
          password: '123456'
        },
        {
          email: employee.email,
          name: employee.name,
          role: employee.role,
          password: '123456'
        }
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
    const users = await prisma.user.findMany({
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
