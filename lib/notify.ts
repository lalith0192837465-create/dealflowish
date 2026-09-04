// Posts a message to a Slack channel via an Incoming Webhook.
// Set up: Slack -> your workspace -> Apps -> "Incoming Webhooks" -> add to a channel.
// Paste the URL it gives you into .env as SLACK_WEBHOOK_URL.
export async function notifySlack(message: string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.log("[notify] SLACK_WEBHOOK_URL not set, skipping. Message was:", message);
    return;
  }
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
}

export function newDealMessage(customerName: string, salesRep: string) {
  return `📋 New deal submitted by ${salesRep} for *${customerName}*. Eng, Finance, and Legal — please review and update your status.`;
}

export function statusUpdateMessage(customerName: string, team: string, status: string) {
  return `🔔 *${customerName}*: ${team} status updated to *${status}*.`;
}

export function finalizedMessage(customerName: string) {
  return `✅ *${customerName}* deal fully approved by Eng, Finance, and Legal. Summary doc generated.`;
}
