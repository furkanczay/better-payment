import { defineI18nUI } from "fumadocs-ui/i18n";
import { i18n } from "./config";

/** Labels of the fumadocs UI (search, table of contents, language picker, ...) */
export const i18nUI = defineI18nUI(i18n, {
  en: { displayName: "English" },
  tr: {
    displayName: "Türkçe",
    search: "Ara",
    searchNoResult: "Sonuç bulunamadı",
    toc: "Bu sayfada",
    tocNoHeadings: "Başlık yok",
    lastUpdate: "Son güncelleme",
    chooseLanguage: "Dil seçin",
    nextPage: "Sonraki sayfa",
    previousPage: "Önceki sayfa",
    chooseTheme: "Tema",
    editOnGithub: "GitHub'da düzenle",
  },
});
