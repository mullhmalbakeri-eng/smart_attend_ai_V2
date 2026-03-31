// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 0. جلب مستخدم واحد (GET)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = Number(resolvedParams.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// 1. التعديل (Update)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = Number(resolvedParams.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    
    // Validate role against Prisma enum
    const validRoles = ["ADMIN", "HR", "EMPLOYEE", "admin", "employee"];
    const validRole = validRoles.includes(body.role) ? body.role : "EMPLOYEE";

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name?.trim(),
        role: validRole,
        departmentId: body.departmentId ? Number(body.departmentId) : undefined,
      },
      include: { department: true },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/users/[id]:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      if (prismaError.code === "P2003") {
        return NextResponse.json({ error: "Foreign key constraint failed" }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: "خطأ في تحديث البيانات" }, { status: 500 });
  }
}

// 2. الحذف (Delete)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = Number(resolvedParams.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error) {
    console.error("DELETE /api/users/[id]:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      if (prismaError.code === "P2003") {
        return NextResponse.json({ error: "لا يمكن حذف المستخدم لوجود سجلات حضور مرتبطة به" }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: "لا يمكن حذف المستخدم لوجود سجلات حضور مرتبطة به" }, { status: 500 });
  }
}