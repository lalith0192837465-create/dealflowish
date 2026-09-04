import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifySlack, newDealMessage } from "@/lib/notify";
import { validateDealInput } from "@/lib/validate";

// POST /api/calls/:id/confirm -> the human clicks "this looks right, go ahead."
// Body can include corrected fields if the AI got something wrong.
// This is the ONLY place a CallReview turns into a real Deal — nothing
// downstream (Stripe, Eng notifications) fires before this happens.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const myRoles = session.roles || [];
  if (!myRoles.includes("sales")) {
    return NextResponse.json({ error: "Only sales can confirm deals" }, { status: 403 });
  }

  const review = await db.callReview.findUnique({ where: { id: params.id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.requestedByEmail !== session.user?.email) {
    return NextResponse.json({ error: "Not your call review" }, { status: 403 });
  }
  if (review.status === "confirmed") return NextResponse.json({ error: "Already confirmed" }, { status: 409 });

  const body = await req.json().catch(() => ({})); // optional corrections from the human
  const customerName = body.customerName ?? review.customerName ?? "Unknown customer";
  const discountPct = body.discountPct ?? review.discountPct ?? 0;
  const trialDays = body.trialDays ?? review.trialDays ?? 14;

  const errors = validateDealInput({ customerName, discountPct, trialDays });
  if (errors.length > 0) return NextResponse.json({ error: errors.join(", ") }, { status: 400 });

  const deal = await db.deal.create({
    data: {
      customerName,
      salesRep: session.user?.name || session.user?.email || "Unknown",
      discountPct,
      trialDays,
      customFeature: body.customFeature ?? review.customFeature,
      fromCallReviewId: review.id,
    },
  });

  await db.callReview.update({
    where: { id: review.id },
    data: { status: "confirmed", confirmedAt: new Date() },
  });

  // This reuses the exact same notification that a manually-entered deal
  // triggers — Eng/Finance/Legal find out the same way either way.
  await notifySlack(newDealMessage(deal.customerName, deal.salesRep));
  if (review.otherNotes) {
    await notifySlack(`ℹ️ Additional notes for *${deal.customerName}*: ${review.otherNotes}`);
  }

  return NextResponse.json(deal, { status: 201 });
}
