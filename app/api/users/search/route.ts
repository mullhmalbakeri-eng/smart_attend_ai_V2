import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ users: [] }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { department: { name: { contains: query } } }, // Assuming a relation
        ],
      },
      include: {
        department: true, // Also including the department details
      }
    });
    return NextResponse.json({ users }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("API search error:", error);
    return NextResponse.json({ error: "Search failed" }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
