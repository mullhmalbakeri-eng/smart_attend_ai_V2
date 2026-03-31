import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // تأكد من مسار بريزما عندك

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for email:', email.toLowerCase());

    // التحقق من وجود المستخدم ودوره
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log('User found in database:', user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    } : 'User not found');

    if (!user || (user as any).password !== password) { // ملاحظة: يجب تشفير الباسورد لاحقاً للأمان العالمي
      console.log('Authentication failed - Invalid credentials');
      return NextResponse.json({ message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    console.log('Authentication successful for user:', user.name);
    console.log('User role:', user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // هذا هو المفتاح الذي يوجه الموظف للماسح والمدير للوحة التحكم
        roleUpper: user.role?.toUpperCase() // إضافة نسخة كبيرة للتأكد
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'خطأ داخلي في السيرفر' }, { status: 500 });
  }
}
