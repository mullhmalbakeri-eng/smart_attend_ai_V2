import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Debug: Log the connection source
    const host = request.headers.get('host');
    const userAgent = request.headers.get('user-agent');
    console.log("Login attempt from:", host);
    console.log("User-Agent:", userAgent);
    
    const { email, password } = await request.json();
    console.log("Login Payload received:", { email, password });
    
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    
    if (!normalizedEmail || typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { error: "بيانات الدخول غير مكتملة" }, 
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Ensure database connection
    await prisma.$connect();
    console.log("PRISMA CONNECTED SUCCESSFULLY");

    // Database query with error handling
    let user;
    try {
      console.log("Attempting Prisma query for email:", normalizedEmail);
      user = await prisma.employee.findUnique({
        where: { email: normalizedEmail },
      });
      console.log("Prisma query result:", user);
    } catch (dbError) {
      console.error("PRISMA DATABASE ERROR:", dbError);
      console.error("Error code:", dbError.code);
      console.error("Error message:", dbError.message);
      return NextResponse.json(
        { error: "خطأ في الاتصال بقاعدة البيانات", details: dbError.message }, 
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    if (!user) {
      console.log("User not found:", normalizedEmail);
      return NextResponse.json(
        { error: "البريد الإلكتروني غير مسجل" }, 
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    if (user.password !== password) {
      console.log("Password mismatch for user:", normalizedEmail);
      return NextResponse.json(
        { error: "كلمة المرور غير صحيحة" }, 
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    
    console.log("Authentication successful for user:", user.name);
    console.log("Login Successful for user, sending response...");
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleUpper: user.role?.toUpperCase() || user.role
      }
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // Mobile-friendly cookie settings
        'Set-Cookie': `auth-token=${user.id}-${user.role}; Path=/; HttpOnly; SameSite=lax; MaxAge=86400; Secure=false`
      }
    });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "خطأ في الاتصال بقاعدة البيانات" }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } finally {
    // Always disconnect to prevent connection leaks
    try { 
      await prisma.$disconnect(); 
    } catch {}
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
