import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// Search runs per locale (the search dialog sends the current locale)
export const { GET } = createFromSource(source, {
  localeMap: {
    en: { language: "english" },
    tr: { language: "turkish" },
  },
});
