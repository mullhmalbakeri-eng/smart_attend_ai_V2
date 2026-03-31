import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Creating temporary admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      
      // Update existing admin user
      const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@test.com' },
        data: {
          password: '123456',
          role: 'ADMIN',
          name: 'Administrator'
        }
      });

      console.log('Admin user updated successfully:', updatedAdmin.email);
      
      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        user: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          name: updatedAdmin.name,
          role: updatedAdmin.role
        }
      });
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          password: '123456',
          role: 'ADMIN',
          name: 'Administrator',
          uuid: 'admin-uuid-' + Date.now()
        }
      });

      console.log('Admin user created successfully:', newAdmin.email);
      
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      });
    }

  } catch (error) {
    console.error('Create Admin API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support GET method to check if admin exists
export async function GET() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
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
      admin: admin,
      exists: !!admin
    });
  } catch (error) {
    console.error('Check Admin API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check admin user'
    }, { status: 500 });
  }
}
