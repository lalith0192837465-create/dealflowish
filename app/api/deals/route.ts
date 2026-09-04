import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifySlack, newDealMessage } from "@/lib/notify";
import { validateDealInput } from "@/lib/validate";

// GET /api/deals -> list every deal, newest first (feeds the dashboard)
export async function GET() {
  const deals = await db.deal.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(deals);
}

// POST /api/deals -> a sales rep submits a new deal. This is the trigger
// that replaces the "manually message eng, finance, and legal" step.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const myRoles = session.roles || [];
  if (!myRoles.includes("sales")) {
    return NextResponse.json({ error: "Only sales can submit deals" }, { status: 403 });
  }

  const body = await req.json();
  const discountPct = Number(body.discountPct) || 0;
  const trialDays = Number(body.trialDays) || 14;

  const errors = validateDealInput({ customerName: body.customerName, discountPct, trialDays });
  if (errors.length > 0) return NextResponse.json({ error: errors.join(", ") }, { status: 400 });

  const deal = await db.deal.create({
    data: {
      customerName: body.customerName,
      salesRep: session.user?.name || session.user?.email || "Unknown",
      discountPct,
      trialDays,
      customFeature: body.customFeature || null,
    },
  });

  await notifySlack(newDealMessage(deal.customerName, deal.salesRep));

  return NextResponse.json(deal, { status: 201 });
}

