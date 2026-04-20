import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const links = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Providers", href: "/#providers" },
    { label: "Quick Start", href: "/#quickstart" },
    { label: "Docs", href: "/docs" },
  ],
  Documentation: [
    { label: "Introduction", href: "/docs" },
    { label: "Installation", href: "/docs/installation" },
    { label: "Configuration", href: "/docs/configuration" },
    { label: "API Reference", href: "/docs/api/handler" },
  ],
  Providers: [
    { label: "İyzico", href: "/docs/providers/iyzico" },
    { label: "PayTR", href: "/docs/providers/paytr" },
    { label: "Parampos", href: "/docs/providers/parampos" },
    { label: "Akbank", href: "/docs/banks/akbank" },
  ],
  Resources: [
    {
      label: "npm",
      href: "https://www.npmjs.com/package/better-payment",
      external: true,
    },
    {
      label: "GitHub",
      href: "https://github.com/furkanczay/better-payment",
      external: true,
    },
    {
      label: "Issues",
      href: "https://github.com/furkanczay/better-payment/issues",
      external: true,
    },
    { label: "Changelog", href: "/docs/guides/changelog" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-4 w-fit group"
            >
              <Image
                src="/better-payment-logo.svg"
                width={304}
                height={64}
                alt="better-payment"
                className="h-16 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[230px]">
              A unified, type-safe payment gateway library for Node.js and
              TypeScript.
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
          {Object.entries(links).map(([group, items]) => (
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
                        href={item.href}
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
            © {new Date().getFullYear()} better-payment. Released under the MIT
            License.
          </span>
          <span className="text-xs text-muted-foreground/35 font-mono">
            Built with Next.js, Tailwind CSS & shadcn/ui
          </span>
        </div>
      </div>
    </footer>
  );
}
