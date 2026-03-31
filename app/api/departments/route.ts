import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { users: true } } },
    });
    const result = departments.map((d) => ({
      id: d.id,
      name: d.name,
      manager: d.manager,
      _count: d._count,
    }));
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/departments:", error);
    // Log actual error for debugging
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, manager } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if (!manager || typeof manager !== "string" || !manager.trim()) {
      return NextResponse.json(
        { error: "Manager is required" },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        manager: manager.trim(),
      },
    });
    return NextResponse.json(department);
  } catch (error) {
    console.error("POST /api/departments:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
