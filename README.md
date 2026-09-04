# DealFlow — demo

What this proves: a sales rep submits a custom deal (discount, trial length,
custom feature), Eng/Finance/Legal each update their own status instead of
being chased over Slack/email, and once all three are done, a clean summary
page is auto-generated. This is the "save time" mechanic from the validation
call, working end to end for one scenario.

## Run it (5 minutes)

You'll need Node.js installed (v18+). If you don't have it, get it from
nodejs.org first, or ask Claude Code to set it up for you.

```bash
cd dealflow
npm install
npx prisma generate
npx prisma db push      # creates the local dev.db file from schema.prisma
npm run dev
```

Then open http://localhost:3000 — the real dashboard starts empty.
Click "Try Demo" on that page to see it working with sample data (that page
never touches the real database — nothing you see there is saved).

## What's real vs. placeholder

- **Real:** the data model, the routing logic, the auto-finalize-when-all-approved
  logic, the summary doc generation. This is the actual product mechanic.
- **Placeholder:** Slack notifications silently no-op until you set
  SLACK_WEBHOOK_URL in a `.env` file (copy `.env.example` to `.env` to start).
  No login/auth yet — anyone with the URL can act as any team. Fine for a demo,
  not fine for a real pilot.
- **Demo page (`/demo`):** hardcoded sample deals, completely separate from
  the real database — safe to show anyone, resets on refresh, never pollutes
  real data. The real dashboard (`/`) starts empty; use "+ New Deal" there
  for anything real.

## Deliberately not built yet (see the "skip for now" list from planning)

Auth/login, multi-tenant isolation, BYOC packaging, billing, audit logs.
These matter for a real pilot, not for validating the workflow itself.

## Next steps once this demo lands a real conversation

1. Swap SQLite for Postgres (Supabase free tier) — a config change, not a rewrite
2. Add basic auth so teams log in as themselves
3. Then, and only then, start the BYOC packaging work for that specific
   customer's cloud
