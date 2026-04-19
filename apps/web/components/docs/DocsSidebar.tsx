"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      { label: "BetterPay Options", href: "/docs#configuration", id: "configuration" },
      { label: "İyzico", href: "/docs#iyzico", id: "iyzico" },
      { label: "PayTR", href: "/docs#paytr", id: "paytr" },
      { label: "Akbank", href: "/docs#akbank", id: "akbank" },
      { label: "Parampos", href: "/docs#parampos", id: "parampos" },
      { label: "Environment Variables", href: "/docs#env", id: "env" },
    ],
  },
  {
    group: "API Reference",
    items: [
      { label: "use()", href: "/docs#use", id: "use" },
      { label: "Named accessors", href: "/docs#named-accessors", id: "named-accessors" },
      { label: "createPayment()", href: "/docs#createpayment", id: "createpayment" },
      { label: "initThreeDSPayment()", href: "/docs#initthreedsPayment", id: "initthreedsPayment" },
      { label: "completeThreeDSPayment()", href: "/docs#completethreedsPayment", id: "completethreedsPayment" },
      { label: "initCheckoutForm()", href: "/docs#checkoutform", id: "checkoutform" },
      { label: "installmentInfo()", href: "/docs#installments", id: "installments" },
      { label: "binCheck()", href: "/docs#bincheck", id: "bincheck" },
      { label: "refund()", href: "/docs#refund", id: "refund" },
      { label: "cancel()", href: "/docs#cancel", id: "cancel" },
      { label: "initializeSubscription()", href: "/docs#subscription", id: "subscription" },
      { label: "initPWIPayment()", href: "/docs#pwi", id: "pwi" },
      { label: "handler", href: "/docs#handler", id: "handler" },
    ],
  },
  {
    group: "Guides",
    items: [
      { label: "3D Secure Payments", href: "/docs#guide-3d", id: "guide-3d" },
      { label: "Subscription Billing", href: "/docs#guide-subscription", id: "guide-subscription" },
      { label: "Protected Wire Transfer", href: "/docs#guide-eft", id: "guide-eft" },
      { label: "Error Handling", href: "/docs#guide-errors", id: "guide-errors" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-4 border-r border-border">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 px-1 group">
        <Image
          src="/better-payment-logo.svg"
          width={320}
          height={320}
          alt="better-payment logo"
          className="h-6 w-auto"
        />
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
          docs
        </Badge>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-6">
        {docsNav.map((section) => (
          <div key={section.group}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50 px-1 mb-2">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={cn(
                      "block px-2 py-1.5 text-[13px] rounded-md transition-colors",
                      pathname === "/docs" && item.href === "/docs"
                        ? "text-primary font-medium bg-primary/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
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
