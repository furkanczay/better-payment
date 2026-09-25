import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE_URL, localePath, type Locale } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...source.getPages("en").map((page) => page.url)];
  const url = (lang: Locale, path: string) => `${SITE_URL}${localePath(lang, path)}`;
  return paths.flatMap((path) =>
    (["en", "tr"] as const).map((lang) => ({
      url: url(lang, path),
      alternates: { languages: { en: url("en", path), tr: url("tr", path) } },
    }))
  );
}
