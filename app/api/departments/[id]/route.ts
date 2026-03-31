import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = Number(id);
    if (!Number.isFinite(numId)) {
      return NextResponse.json(
        { error: "Invalid department id" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const { name, manager } = body;

    const data: { name?: string; manager?: string } = {};
    if (name != null && typeof name === "string" && name.trim())
      data.name = name.trim();
    if (manager != null && typeof manager === "string" && manager.trim())
      data.manager = manager.trim();

    const department = await prisma.department.update({
      where: { id: numId },
      data,
    });
    return NextResponse.json(department);
  } catch (error) {
    console.error("PUT /api/departments/[id]:", error);
    if (error && typeof error === "object" && "code" in error) {
      if ((error as { code: string }).code === "P2025")
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
    }
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = Number(id);
    if (!Number.isFinite(numId)) {
      return NextResponse.json(
        { error: "Invalid department id" },
        { status: 400 }
      );
    }
    await prisma.department.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/departments/[id]:", error);
    if (error && typeof error === "object" && "code" in error) {
      if ((error as { code: string }).code === "P2025")
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      if ((error as { code: string }).code === "P2003")
        return NextResponse.json(
          { error: "Cannot delete department with linked users" },
          { status: 409 }
        );
    }
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
