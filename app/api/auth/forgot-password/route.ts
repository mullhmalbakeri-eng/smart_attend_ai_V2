import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    console.log('Password reset requested for email:', email.toLowerCase());

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({ 
        message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة قريباً' 
      });
    }

    // TODO: Implement actual email sending logic here
    // For now, just return success message
    console.log('Password reset email would be sent to:', user.email);

    return NextResponse.json({ 
      message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' 
    });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ 
      message: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى' 
    }, { status: 500 });
  }
}
