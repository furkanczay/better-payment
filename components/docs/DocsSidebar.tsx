"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package2 } from "lucide-react";

export const docsNav = [
  {
    group: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs", id: "introduction" },
      { label: "Installation", href: "/docs#installation", id: "installation" },
      { label: "Quick Start", href: "/docs#quickstart", id: "quickstart" },
    ],
  },
  {
    group: "Configuration",
    items: [
      { label: "BetterPayment Options", href: "/docs#configuration", id: "configuration" },
      { label: "Environment Variables", href: "/docs#env", id: "env" },
    ],
  },
  {
    group: "Providers",
    items: [
      { label: "İyzico", href: "/docs#iyzico", id: "iyzico" },
      { label: "PayTR", href: "/docs#paytr", id: "paytr" },
      { label: "Parampos", href: "/docs#parampos", id: "parampos" },
    ],
  },
  {
    group: "API Reference",
    items: [
      { label: "createPayment()", href: "/docs#createpayment", id: "createpayment" },
      { label: "create3DPayment()", href: "/docs#create3dpayment", id: "create3dpayment" },
      { label: "createCheckoutForm()", href: "/docs#checkoutform", id: "checkoutform" },
      { label: "createSubscription()", href: "/docs#subscription", id: "subscription" },
      { label: "use(provider)", href: "/docs#use", id: "use" },
      { label: "inquireInstallments()", href: "/docs#installments", id: "installments" },
    ],
  },
  {
    group: "Guides",
    items: [
      { label: "3D Secure Payments", href: "/docs#guide-3d", id: "guide-3d" },
      { label: "Subscription Billing", href: "/docs#guide-subscription", id: "guide-subscription" },
      { label: "EFT / IBAN Transfer", href: "/docs#guide-eft", id: "guide-eft" },
      { label: "Error Handling", href: "/docs#guide-errors", id: "guide-errors" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-6 border-r border-border">
      <Link href="/" className="flex items-center gap-2 mb-8 px-2">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <Package2 className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-foreground">better-payment</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">docs</Badge>
      </Link>

      <nav className="flex flex-col gap-6">
        {docsNav.map((section) => (
          <div key={section.group}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={cn(
                      "block px-2 py-1.5 text-sm rounded-md transition-colors",
                      pathname === "/docs" && item.href === "/docs"
                        ? "text-primary font-medium bg-primary/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
