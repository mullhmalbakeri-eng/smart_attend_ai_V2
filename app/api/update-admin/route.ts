import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Updating admin user password...');
    
    // Update existing admin user
    const updatedAdmin = await prisma.user.update({
      where: { email: 'mullhm200231@gmail.com' },
      data: {
        password: '123456',
        role: 'ADMIN'
      } as any
    });

    console.log('Admin user updated successfully:', updatedAdmin.email);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user password updated successfully',
      user: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        role: updatedAdmin.role
      }
    });

  } catch (error) {
    console.error('Update Admin API Error:', error);
    
    // If user doesn't exist, create them
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      try {
        const newAdmin = await prisma.user.create({
          data: {
            email: 'mullhm200231@gmail.com',
            password: '123456',
            role: 'ADMIN',
            name: 'Administrator',
            uuid: 'admin-uuid-' + Date.now()
          } as any
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
      } catch (createError) {
        console.error('Create Admin Error:', createError);
        return NextResponse.json({
          success: false,
          message: 'Failed to create admin user',
          error: createError instanceof Error ? createError.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'mullhm200231@gmail.com' },
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
