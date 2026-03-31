import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json(
        { error: "UUID is required" },
        { status: 400 }
      );
    }

    // Find user by UUID
    const user = await prisma.user.findUnique({
      where: { uuid },
      include: {
        department: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    console.error("POST /api/users/lookup:", error);
    return NextResponse.json(
      { error: "Failed to lookup user" },
      { status: 500 }
    );
  }
}
