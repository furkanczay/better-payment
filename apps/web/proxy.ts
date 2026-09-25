import { NextResponse, type NextRequest } from "next/server";

const LOCALE_COOKIE = "bp_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;
// Crawlers are never redirected: they index each locale at its own URL (hreflang)
const BOT = /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|embedly|preview|lighthouse|headless/i;

/** True when Accept-Language ranks Turkish above English */
function prefersTurkish(header: string | null): boolean {
  if (!header) return false;
  let tr = -1;
  let en = -1;
  for (const part of header.split(",")) {
    const [tag, ...params] = part.trim().toLowerCase().split(";");
    const qParam = params.find((p) => p.trim().startsWith("q="));
    const q = qParam ? Number(qParam.trim().slice(2)) : 1;
    const primary = tag.split("-")[0];
    if (primary === "tr") tr = Math.max(tr, q);
    if (primary === "en") en = Math.max(en, q);
  }
  return tr > 0 && tr > en;
}

function remember(response: NextResponse, locale: "en" | "tr"): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  return response;
}

/**
 * - `/tr/...` is Turkish; visiting it remembers the choice.
 * - `/en/...` redirects to the unprefixed English URL (the language switcher uses it).
 * - Unprefixed URLs are English. On the first visit, a browser that prefers Turkish
 *   is redirected to `/tr/...`; the choice is remembered in a cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;

  if (segment === "tr") {
    const response = NextResponse.next();
    return cookie === "tr" ? response : remember(response, "tr");
  }

  if (segment === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return remember(NextResponse.redirect(url), "en");
  }

  const isBot = BOT.test(request.headers.get("user-agent") ?? "");
  const wantsTurkish =
    cookie === "tr" ||
    (!cookie && !isBot && prefersTurkish(request.headers.get("accept-language")));

  if (wantsTurkish) {
    const url = request.nextUrl.clone();
    url.pathname = `/tr${pathname === "/" ? "" : pathname}`;
    return remember(NextResponse.redirect(url), "tr");
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  return cookie || isBot ? response : remember(response, "en");
}

export const config = {
  // Pages only: not API routes, Next.js internals, metadata routes or static files
  matcher: ["/((?!api|_next|sitemap.xml|robots.txt|favicon.ico|.*\\..*).*)"],
};
