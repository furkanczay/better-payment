import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { localePath, type Locale } from "@/lib/i18n/config";

function footerLinks(t: Dictionary["footer"]) {
  return [
    {
      group: t.groups.product,
      items: [
        { label: t.links.features, href: "/#features" },
        { label: t.links.providers, href: "/#providers" },
        { label: t.links.quickStart, href: "/#quickstart" },
        { label: t.links.docs, href: "/docs" },
      ],
    },
    {
      group: t.groups.documentation,
      items: [
        { label: t.links.introduction, href: "/docs" },
        { label: t.links.installation, href: "/docs/installation" },
        { label: t.links.configuration, href: "/docs/concepts/configuration" },
        { label: t.links.apiReference, href: "/docs/reference/types" },
      ],
    },
    {
      group: t.groups.providers,
      items: [
        { label: "iyzico", href: "/docs/providers/iyzico" },
        { label: "PayTR", href: "/docs/providers/paytr" },
        { label: "Parampos", href: "/docs/providers/parampos" },
        { label: "Akbank", href: "/docs/banks/akbank" },
      ],
    },
    {
      group: t.groups.resources,
      items: [
        { label: "npm", href: "https://www.npmjs.com/package/better-payment", external: true },
        { label: "GitHub", href: "https://github.com/furkanczay/better-payment", external: true },
        { label: t.links.issues, href: "https://github.com/furkanczay/better-payment/issues", external: true },
        { label: t.links.whatsNew, href: "/docs/whats-new" },
        { label: t.links.changelog, href: "/docs/reference/changelog" },
      ],
    },
  ];
}

export default function Footer({ lang, t }: { lang: Locale; t: Dictionary["footer"] }) {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2">
            <Link
              href={localePath(lang, "/")}
              className="flex items-center gap-2.5 mb-4 w-fit group"
            >
              <Image src="/logo.svg" width={1000} height={897} alt="" className="h-9 w-auto" />
              <Image
                src="/better-payment-logo.svg"
                width={304}
                height={64}
                alt="better-payment"
                className="h-16 w-auto brightness-0 dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[230px]">
              {t.tagline}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com/furkanczay/better-payment"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground border border-border/60 rounded-md px-2.5 py-1 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/better-payment"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground border border-border/60 rounded-md px-2.5 py-1 transition-colors"
              >
                npm
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks(t).map(({ group, items }) => (
            <div key={group} className="col-span-1">
              <h4 className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {"external" in item && item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={localePath(lang, item.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mt-14 mb-7" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} better-payment. {t.license}
          </span>
          <span className="text-xs text-muted-foreground/35 font-mono">
            {t.builtWith}
          </span>
        </div>
      </div>
    </footer>
  );
}
