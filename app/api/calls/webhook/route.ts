import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTranscriptText } from "@/lib/recall";
import { extractDealFromTranscript } from "@/lib/extract";
import { notifySlack } from "@/lib/notify";

// POST /api/calls/webhook -> Recall.ai calls this automatically when the bot's
// recording/transcript is ready. Configure this URL (with the secret below)
// in the Recall.ai dashboard under Webhooks (Settings -> Webhooks).
export async function POST(req: Request) {
  // Simple shared-secret check so only Recall.ai (who we've given this URL
  // with the secret attached) can hit this endpoint. Set WEBHOOK_SECRET to
  // any random string and add ?secret=<that string> to the webhook URL in
  // the Recall.ai dashboard. Not the strongest possible verification (real
  // Svix signature checking is stronger) but stops anyone else from being
  // able to fake a "deal closed" event.
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await req.json();

  // We only care about the bot finishing up. Ignore everything else (joining,
  // in-progress status changes, etc.) — nothing to do until it's done.
  const botId = event?.data?.bot?.id;
  const statusCode = event?.data?.status?.code || event?.data?.data?.code;
  if (!botId || statusCode !== "done") {
    return NextResponse.json({ ok: true }); // acknowledge, nothing to do yet
  }

  const review = await db.callReview.findUnique({ where: { recallBotId: botId } });
  if (!review) return NextResponse.json({ ok: true }); // not one of ours, ignore

  try {
    const transcript = await getTranscriptText(botId);
    const extracted = await extractDealFromTranscript(transcript);

    const updated = await db.callReview.update({
      where: { id: review.id },
      data: {
        transcript,
        status: extracted.closedWon ? "ready" : "closed_lost",
        closedWon: extracted.closedWon,
        customerName: extracted.customerName,
        discountPct: extracted.discountPct,
        trialDays: extracted.trialDays,
        customFeature: extracted.customFeature,
        otherNotes: extracted.otherNotes,
      },
    });

    if (extracted.closedWon) {
      await notifySlack(`📞 Call with *${extracted.customerName || "a customer"}* looks closed — review and confirm: /review/${updated.id}`);
    }
  } catch (err) {
    console.error("[calls/webhook] failed to process call", err);
    await db.callReview.update({ where: { id: review.id }, data: { status: "failed" } });
  }

  return NextResponse.json({ ok: true });
}
