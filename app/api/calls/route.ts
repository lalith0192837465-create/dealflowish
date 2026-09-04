import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/calls -> pending reviews for the signed-in sales rep to check
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const reviews = await db.callReview.findMany({
    where: { requestedByEmail: session.user!.email!, status: { in: ["processing", "ready", "closed_lost", "failed"] } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}
