import { defineI18n } from "fumadocs-core/i18n";

/**
 * English is the default and keeps the unprefixed URLs (`/docs/...`), so existing
 * links keep working. Turkish lives under `/tr/...`.
 */
export const i18n = defineI18n({
  languages: ["en", "tr"],
  defaultLanguage: "en",
  hideLocale: "default-locale",
  parser: "dot",
  // A page missing in one language falls back to the other (with a notice)
  fallbackLanguage: "en",
});

export type Locale = (typeof i18n.languages)[number];

export const LOCALES = i18n.languages as Locale[];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bp_locale";
export const SITE_URL = "https://better-payment.czaylabs.com";

export const LOCALE_NAMES: Record<Locale, string> = { en: "English", tr: "Türkçe" };

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "tr";
}

/** Adds the locale prefix to an internal path: ("tr", "/docs") → "/tr/docs" */
export function localePath(lang: Locale, path: string): string {
  if (!path.startsWith("/") || lang === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${lang}`;
  if (path.startsWith("/#")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

/** Removes a locale prefix: "/tr/docs/x" → "/docs/x" */
export function stripLocale(path: string): string {
  const match = /^\/(en|tr)(?=\/|$)/.exec(path);
  if (!match) return path;
  return path.slice(match[0].length) || "/";
}

/** hreflang alternates for a path without locale prefix */
export function alternates(path: string, lang: Locale) {
  const clean = stripLocale(path);
  return {
    canonical: localePath(lang, clean),
    languages: {
      en: localePath("en", clean),
      tr: localePath("tr", clean),
      "x-default": localePath("en", clean),
    },
  };
}
