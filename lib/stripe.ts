// Uses a RESTRICTED Stripe key (not your main secret key). When you create it
// in the Stripe dashboard, set: Invoices = Write, Customers = Read,
// everything else = None. That means this key physically cannot charge
// anyone, issue refunds, or touch payouts — only look up a customer and
// prepare a draft invoice for a human to review before it's ever sent.
import Stripe from "stripe";

const stripe = process.env.STRIPE_RESTRICTED_KEY
  ? new Stripe(process.env.STRIPE_RESTRICTED_KEY, { apiVersion: "2024-06-20" })
  : null;

// Creates a DRAFT invoice only. Does not finalize or send it — a human
// still reviews and sends it from the Stripe dashboard. This mirrors the
// "read and draft, nothing more" permission you set on the key itself.
export async function draftInvoiceForDeal(deal: {
  customerName: string;
  discountPct: number;
  customFeature: string | null;
}) {
  if (!stripe) {
    console.log("[stripe] STRIPE_RESTRICTED_KEY not set, skipping draft invoice for", deal.customerName);
    return null;
  }

  // Look up an existing customer by name (Read permission) rather than
  // creating one, since this key can't write customers — only invoices.
  const customers = await stripe.customers.search({ query: `name~"${deal.customerName.replace(/"/g, '\\"')}"`, limit: 1 });
  if (customers.data.length === 0) {
    console.log(`[stripe] No existing Stripe customer found for "${deal.customerName}" — skipping draft. Create the customer in Stripe first.`);
    return null;
  }

  const invoice = await stripe.invoices.create({
    customer: customers.data[0].id,
    collection_method: "send_invoice",
    days_until_due: 30,
    description: deal.customFeature || undefined,
    metadata: { discountPct: String(deal.discountPct), source: "dealflow" },
    auto_advance: false, // stays a draft — never auto-finalizes or auto-sends
  });

  return invoice; // status: "draft" — a human reviews and sends it from Stripe
}
