export { default } from "next-auth/middleware";

// Everything matched here REQUIRES a signed-in, rostered user.
// /demo, /signin, and the auth API routes are deliberately left open.
export const config = {
  matcher: [
    "/",
    "/deals/:path*",
    "/review/:path*",
    "/api/deals/:path*",
    "/api/calls",
    "/api/calls/start",
    "/api/calls/:id",
    "/api/calls/:id/confirm",
    // Deliberately NOT matching /api/calls/webhook — that endpoint must stay
    // reachable by Recall.ai without a login session. It's protected instead
    // by the WEBHOOK_SECRET check inside the route itself.
  ],
};
