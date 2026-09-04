// Basic sanity checks on deal numbers, used anywhere a deal gets created
// (manual form or confirmed from a call). Keeps obviously-wrong data
// (negative discounts, 400% off, etc.) from ever reaching the database.
export function validateDealInput(input: { customerName?: string; discountPct?: number; trialDays?: number }) {
  const errors: string[] = [];

  if (!input.customerName || input.customerName.trim().length === 0) {
    errors.push("customerName is required");
  }
  if (input.discountPct !== undefined && (input.discountPct < 0 || input.discountPct > 100)) {
    errors.push("discountPct must be between 0 and 100");
  }
  if (input.trialDays !== undefined && (input.trialDays < 0 || input.trialDays > 365)) {
    errors.push("trialDays must be between 0 and 365");
  }

  return errors;
}
