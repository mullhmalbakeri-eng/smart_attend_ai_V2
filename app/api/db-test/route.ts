import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log("✅ User count:", userCount);
    
    // Test the actual query with error handling
    const users = await prisma.user.findMany({
      include: { department: true },
      take: 5, // Limit to prevent large responses
    });
    
    console.log("✅ Found users:", users.length);
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department?.name || null
      }))
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json({ 
      error: "Database connection failed", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace"
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
