import { NextRequest, NextResponse } from "next/server";
import { getBetterPayment } from "@/lib/payment";
import type { BetterPaymentRequest } from "better-payment";

async function handler(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";
  let body: unknown;

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => undefined);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const fd = await req.formData();
      const obj: Record<string, string> = {};
      fd.forEach((v, k) => { obj[k] = v as string; });
      body = obj;
    }
  }

  const betterPayReq: BetterPaymentRequest = {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body,
  };

  const res = await getBetterPayment().handler.handle(betterPayReq);

  return NextResponse.json(res.body, {
    status: res.status,
    headers: res.headers,
  });
}

export const GET = handler;
export const POST = handler;
