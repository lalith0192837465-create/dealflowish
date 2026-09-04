// This is your team roster. Add a teammate's Google email here with their
// role, and they can sign in. Remove a line to revoke their access.
// Roles must be exactly one of: "sales" | "eng" | "finance" | "legal"
// A person can have multiple roles if they wear more than one hat.

export type Role = "sales" | "eng" | "finance" | "legal";

export const TEAM: Record<string, Role[]> = {
  // "you@gmail.com": ["sales"],
  // "engperson@gmail.com": ["eng"],
  // "financeperson@gmail.com": ["finance"],
  // "legalperson@gmail.com": ["legal"],
};

export function rolesFor(email: string | null | undefined): Role[] {
  if (!email) return [];
  return TEAM[email.toLowerCase()] || [];
}

// Which team role is allowed to edit which status field.
export const FIELD_OWNER: Record<string, Role> = {
  engStatus: "eng",
  financeStatus: "finance",
  legalStatus: "legal",
};
