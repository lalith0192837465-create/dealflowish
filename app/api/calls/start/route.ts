import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { startBot } from "@/lib/recall";

// POST /api/calls/start -> sales pastes a Zoom link, we send the listener bot in.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const myRoles = session.roles || [];
  if (!myRoles.includes("sales")) {
    return NextResponse.json({ error: "Only sales can start call listening" }, { status: 403 });
  }

  const { zoomUrl } = await req.json();
  if (!zoomUrl) return NextResponse.json({ error: "zoomUrl is required" }, { status: 400 });

  const bot = await startBot(zoomUrl);

  const review = await db.callReview.create({
    data: {
      recallBotId: bot.id,
      zoomUrl,
      requestedByEmail: session.user!.email!,
      status: "processing",
    },
  });

  return NextResponse.json(review, { status: 201 });
}
