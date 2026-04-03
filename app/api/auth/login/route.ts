import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    
    if (!normalizedEmail || typeof password !== "string") {
      return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 400 });
    }

    console.log("Login attempt for email:", normalizedEmail);

    // Check database connection
    try {
      const usersCount = await prisma.user.count();
      if (usersCount === 0) {
        return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 500 });
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 500 });
    }

    // Find user in database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (findError) {
      console.error("User lookup error:", findError);
      return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 500 });
    }

    console.log('User found in database:', user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    } : 'User not found');

    if (!user || user.password !== password) {
      console.log('Authentication failed - Invalid credentials');
      return NextResponse.json({ error: 'بيانات خاطئة أو مشكلة في قاعدة البيانات' }, { status: 401 });
    }

    console.log('Authentication successful for user:', user.name);
    console.log('User role:', user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleUpper: user.role?.toUpperCase()
      }
    });

  } catch (error) {
    console.error("Login API Error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Check for Prisma-specific errors
      if (error.message.includes('Prisma') || error.message.includes('database')) {
        return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 500 });
      }
      
      // Check for JSON parsing errors
      if (error.message.includes('JSON')) {
        return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 400 });
      }
    }
    
    // Generic fallback error
    return NextResponse.json({ error: "بيانات خاطئة أو مشكلة في قاعدة البيانات" }, { status: 500 });
  }
}
