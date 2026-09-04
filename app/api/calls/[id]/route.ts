import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/calls/:id -> a single call review, only visible to the sales rep
// who requested it. Prevents anyone from browsing other reps' call transcripts.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const review = await db.callReview.findUnique({ where: { id: params.id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.requestedByEmail !== session.user?.email) {
    return NextResponse.json({ error: "Not your call review" }, { status: 403 });
  }

  return NextResponse.json(review);
}
