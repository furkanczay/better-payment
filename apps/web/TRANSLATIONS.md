# Docs translations / Doküman çevirileri

The website and docs are available in English (default, `/docs/...`) and Turkish (`/tr/docs/...`).

## Files

| What | English | Turkish |
| ---- | ------- | ------- |
| Docs page | `content/docs/<path>.mdx` | `content/docs/<path>.tr.mdx` |
| Sidebar titles and order | `content/docs/<dir>/meta.json` | `content/docs/<dir>/meta.tr.json` |
| Homepage and site texts | `lib/i18n/dictionary.ts` (`en`) | `lib/i18n/dictionary.ts` (`tr`) |
| Docs UI labels (search, TOC, …) | fumadocs defaults | `lib/i18n/ui.ts` |

## Rules

1. **Translate prose only.** Code blocks are shared: keep them byte-for-byte identical to the English page, including comments.
2. **Keep the structure.** Same headings (same levels, same order), same tables and callouts. Every Turkish heading keeps the English heading's id: `## Taksit [#installments]`. Run `node scripts/check-translations.mjs --fix` to add the ids.
3. **Links** to other docs pages are written without a locale (`/docs/guides/testing`); they are localized automatically.
4. **Frontmatter** values must not contain a second `: `. Use `—` or quote the value.
5. When you change an English page, update its Turkish page in the same PR (and vice versa). A page without a translation falls back to the other language with a notice, but CI rejects it.

```bash
cd apps/web
node scripts/check-translations.mjs        # what CI runs
node scripts/check-translations.mjs --fix  # add/fix heading ids
```

## Glossary / Terimler

Use these terms consistently in the Turkish docs. Code identifiers (`capture()`, `paymentId`, …) are never translated.

| English | Türkçe |
| ------- | ------ |
| payment provider / gateway | ödeme sağlayıcısı |
| payment institution | ödeme kuruluşu |
| virtual POS | sanal POS |
| merchant | üye işyeri |
| pre-authorization | ön provizyon |
| capture | capture (provizyon kapama) |
| void | void / iptal |
| refund / partial refund | iade / kısmi iade |
| cancel | iptal |
| installment | taksit |
| stored card / tokenization | kayıtlı kart / tokenizasyon |
| callback | callback |
| notification (PayTR) | bildirim |
| order id | sipariş numarası |
| request / response | istek / yanıt |
| request validation | istek doğrulama |
| error code | hata kodu |
| retry | yeniden deneme |
| edge runtime | edge ortamı |
| handler, adapter, route, hook, token, sandbox | (English term kept) |
| non-3D | 3D'siz |
