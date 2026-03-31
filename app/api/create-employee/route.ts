import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Creating temporary employee user...');

    // Check if employee user already exists
    const existingEmployee = await prisma.user.findUnique({
      where: { email: 'employee@test.com' }
    });

    if (existingEmployee) {
      console.log('Employee user already exists, updating...');
      
      // Update existing employee user
      const updatedEmployee = await prisma.user.update({
        where: { email: 'employee@test.com' },
        data: {
          password: '123456',
          role: 'EMPLOYEE',
          name: 'Test Employee'
        }
      });

      console.log('Employee user updated successfully:', updatedEmployee.email);
      
      return NextResponse.json({
        success: true,
        message: 'Employee user updated successfully',
        user: {
          id: updatedEmployee.id,
          email: updatedEmployee.email,
          name: updatedEmployee.name,
          role: updatedEmployee.role
        }
      });
    } else {
      // Create new employee user
      const newEmployee = await prisma.user.create({
        data: {
          email: 'employee@test.com',
          password: '123456',
          role: 'EMPLOYEE',
          name: 'Test Employee',
          uuid: 'employee-uuid-' + Date.now()
        }
      });

      console.log('Employee user created successfully:', newEmployee.email);
      
      return NextResponse.json({
        success: true,
        message: 'Employee user created successfully',
        user: {
          id: newEmployee.id,
          email: newEmployee.email,
          name: newEmployee.name,
          role: newEmployee.role
        }
      });
    }

  } catch (error) {
    console.error('Create Employee API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create employee user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support GET method to check if employee exists
export async function GET() {
  try {
    const employee = await prisma.user.findUnique({
      where: { email: 'employee@test.com' },
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
      employee: employee,
      exists: !!employee
    });
  } catch (error) {
    console.error('Check Employee API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check employee user'
    }, { status: 500 });
  }
}
