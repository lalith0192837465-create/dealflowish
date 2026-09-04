import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { rolesFor } from "@/config/roles";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // This is the actual security gate: only emails listed in config/roles.ts
    // can sign in at all. Anyone else's Google login is rejected outright.
    async signIn({ user }) {
      const roles = rolesFor(user.email);
      return roles.length > 0;
    },
    // Attach the person's role(s) to their session so the app knows what
    // they're allowed to edit.
    async session({ session }) {
      session.roles = rolesFor(session.user?.email);
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
