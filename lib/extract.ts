// Sends the call transcript to Claude and asks it to pull out deal terms.
// This is a DRAFT — a human always confirms before anything is real
// (see app/review/[id]/page.tsx). The AI can be wrong; that's expected.
export type Extraction = {
  closedWon: boolean;
  customerName: string | null;
  discountPct: number | null;
  trialDays: number | null;
  customFeature: string | null; // what Eng needs to build, in plain English
  otherNotes: string | null;     // anything else worth flagging
};

export async function extractDealFromTranscript(transcript: string): Promise<Extraction> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to your .env file — see .env.example.");
  }
  const prompt = `You are reading a transcript of a sales call. Extract the deal terms, if any were agreed.

Respond with ONLY a JSON object, no other text, in exactly this shape:
{
  "closedWon": boolean,          // true only if the deal was clearly closed/won on this call
  "customerName": string|null,   // the customer/company name
  "discountPct": number|null,    // discount percentage promised, if any
  "trialDays": number|null,      // trial length in days, if mentioned
  "customFeature": string|null,  // plain-English description of any custom feature or work promised, for an engineer to read. null if none.
  "otherNotes": string|null      // anything else another team (legal, support, etc.) should know. null if nothing notable.
}

If the deal did not clearly close, set closedWon to false and leave the other fields as best guesses or null.

Transcript:
${transcript}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    // If parsing fails, fail safe: don't guess a closed deal, flag it for a human instead.
    return {
      closedWon: false,
      customerName: null,
      discountPct: null,
      trialDays: null,
      customFeature: null,
      otherNotes: "AI extraction failed to parse — please fill this in manually from the transcript.",
    };
  }
}
