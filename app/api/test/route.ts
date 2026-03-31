import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    // Test the actual query
    const users = await prisma.user.findMany({
      include: { department: true },
    });
    
    console.log("Found users:", users.length);
    
    return NextResponse.json({ 
      success: true, 
      userCount, 
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department?.name || null
      }))
    });
  } catch (error) {
    console.error("Test API error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
