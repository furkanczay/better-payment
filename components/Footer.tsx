import { Package2 } from "lucide-react";
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
    { label: "npm", href: "https://www.npmjs.com/package/better-payment", external: true },
    { label: "GitHub", href: "https://github.com/furkanczay/better-payment", external: true },
    { label: "Issues", href: "https://github.com/furkanczay/better-payment/issues", external: true },
    { label: "Changelog", href: "https://github.com/furkanczay/better-payment/releases", external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Package2 className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">better-payment</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A unified, type-safe payment gateway library for Node.js applications.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{group}</h4>
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2025 better-payment. Open source under MIT License.</span>
          <span>Built with Next.js & shadcn/ui</span>
        </div>
      </div>
    </footer>
  );
}
