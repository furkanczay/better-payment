import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const links = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Providers", href: "/#providers" },
    { label: "Quick Start", href: "/#quickstart" },
  ],
  Documentation: [
    { label: "Introduction", href: "/docs" },
    { label: "Installation", href: "/docs#installation" },
    { label: "Configuration", href: "/docs#configuration" },
    { label: "API Reference", href: "/docs#api" },
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
    {
      label: "Changelog",
      href: "https://github.com/furkanczay/better-payment/releases",
      external: true,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <Image
                src="/better-payment-logo.svg"
                width={320}
                height={320}
                alt="better-payment logo"
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              A unified, type-safe payment gateway library for Node.js.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
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

        <Separator className="mt-12 mb-6" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground/60">
            © 2025 better-payment. Open source under MIT License.
          </span>
          <span className="text-xs text-muted-foreground/40 font-mono">
            Built with Next.js & shadcn/ui
          </span>
        </div>
      </div>
    </footer>
  );
}
