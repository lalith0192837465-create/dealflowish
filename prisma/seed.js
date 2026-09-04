// Populates the dashboard with example deals so it looks real for demos.
// Run with: npm run seed
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.deal.deleteMany();

  await prisma.deal.createMany({
    data: [
      {
        customerName: "Northwind Bank",
        salesRep: "Chizu A.",
        discountPct: 15,
        trialDays: 30,
        customFeature: "Custom SSO integration for their auth team",
        engStatus: "scoped",
        financeStatus: "invoiced",
        legalStatus: "pending",
      },
      {
        customerName: "Vale Logistics",
        salesRep: "Chizu A.",
        discountPct: 10,
        trialDays: 14,
        customFeature: null,
        engStatus: "pending",
        financeStatus: "pending",
        legalStatus: "pending",
      },
      {
        customerName: "Harborline Retail",
        salesRep: "Marcus T.",
        discountPct: 20,
        trialDays: 45,
        customFeature: "Bulk CSV export for their finance team",
        engStatus: "scoped",
        financeStatus: "invoiced",
        legalStatus: "approved",
        finalizedAt: new Date(),
      },
      {
        customerName: "Solace Health",
        salesRep: "Marcus T.",
        discountPct: 5,
        trialDays: 14,
        customFeature: "Blocked on eng — needs HIPAA-compliant data handling review",
        engStatus: "blocked",
        financeStatus: "pending",
        legalStatus: "pending",
      },
    ],
  });

  console.log("Seeded 4 demo deals.");
}

main().finally(() => prisma.$disconnect());
