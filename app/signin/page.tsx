"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 20, textAlign: "center" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>DealFlow</h1>
      <p style={{ color: "#8b8f9a", fontSize: 14, marginBottom: 24 }}>
        Sign in with your work Google account. Only invited teammates can access this.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{
          background: "#4ade80", color: "#0b0d12", border: "none", borderRadius: 8,
          padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14,
        }}
      >
        Sign in with Google
      </button>
      <p style={{ color: "#8b8f9a", fontSize: 12, marginTop: 20 }}>
        Just want to look around? <a href="/demo" style={{ color: "#4ade80" }}>Try the demo</a> — no sign-in needed.
      </p>
    </main>
  );
}
