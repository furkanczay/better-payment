import { getBetterPayment } from "@/lib/payment";
import type { BetterPaymentRequest } from "better-payment";

// better-payment also runs on the edge runtime; the demo uses Node.js
export const runtime = "nodejs";

async function handler(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") ?? "";
  let body: unknown;

  if (req.method !== "GET" && req.method !== "HEAD") {
    const text = await req.text();
    if (contentType.includes("application/json")) {
      try {
        body = text ? JSON.parse(text) : undefined;
      } catch {
        return Response.json({ error: true, message: "Invalid JSON body" }, { status: 400 });
      }
    } else {
      // Form-urlencoded provider callbacks are passed as raw text; the handler parses them
      body = text;
    }
  }

  const betterPayReq: BetterPaymentRequest = {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body,
  };

  const res = await getBetterPayment().handler.handle(betterPayReq);

  // Redirects (callbackRedirect) carry no body
  if (res.status >= 300 && res.status < 400) {
    return new Response(null, { status: res.status, headers: res.headers });
  }

  // Text responses (e.g. the PayTR "OK" acknowledgement) must not be JSON-encoded
  const payload = typeof res.body === "string" ? res.body : JSON.stringify(res.body);
  return new Response(payload, { status: res.status, headers: res.headers });
}

export const GET = handler;
export const POST = handler;
