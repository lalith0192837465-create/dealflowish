import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifySlack, statusUpdateMessage, finalizedMessage } from "@/lib/notify";
import { draftInvoiceForDeal } from "@/lib/stripe";
import { FIELD_OWNER } from "@/config/roles";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const allowedFields = ["engStatus", "financeStatus", "legalStatus"];
  if (!allowedFields.includes(body.field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  // The actual enforcement: your role must match the field you're trying to edit.
  // Eng cannot mark Legal as approved, Finance cannot mark Eng as scoped, etc.
  const requiredRole = FIELD_OWNER[body.field];
  const myRoles = session.roles || [];
  if (!myRoles.includes(requiredRole)) {
    return NextResponse.json({ error: `Only ${requiredRole} can update this field` }, { status: 403 });
  }


  const deal = await db.deal.update({
    where: { id: params.id },
    data: { [body.field]: body.value },
  });

  const teamLabel = { engStatus: "Eng", financeStatus: "Finance", legalStatus: "Legal" }[body.field];
  await notifySlack(statusUpdateMessage(deal.customerName, teamLabel!, body.value));

  // Finance marking "invoiced" is the trigger to draft the real Stripe invoice —
  // replaces the manual step of someone building it by hand after being told the terms.
  if (body.field === "financeStatus" && body.value === "invoiced") {
    await draftInvoiceForDeal(deal);
  }

  // If all three teams have signed off, auto-finalize and generate the summary.
  const allApproved =
    deal.engStatus === "scoped" &&
    deal.financeStatus === "invoiced" &&
    deal.legalStatus === "approved";

  if (allApproved && !deal.finalizedAt) {
    const finalized = await db.deal.update({
      where: { id: params.id },
      data: { finalizedAt: new Date() },
    });
    await notifySlack(finalizedMessage(finalized.customerName));
    return NextResponse.json(finalized);
  }

  return NextResponse.json(deal);
}

// GET /api/deals/:id -> single deal detail, used by the summary doc page
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const deal = await db.deal.findUnique({ where: { id: params.id } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}
