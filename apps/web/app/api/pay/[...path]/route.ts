import { toNextJsHandler } from "better-payment/next";
import { getBetterPayment } from "@/lib/payment";

// better-payment also runs on the edge runtime; the demo uses Node.js
export const runtime = "nodejs";

// Lazy: the instance is created on the first request, so builds work without env vars
export const { GET, POST } = toNextJsHandler(getBetterPayment);
