"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Providers", href: "/#providers" },
  { label: "Quick Start", href: "/#quickstart" },
  { label: "Docs", href: "/docs" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;
  return (
    <button
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "h-8 w-8 text-muted-foreground hover:text-foreground",
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-[15px] w-[15px]" />
      ) : (
        <Moon className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-background/85 backdrop-blur-2xl border-b border-border"
          : "bg-background/60 backdrop-blur-xl border-b border-transparent",
      )}
    >
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/better-payment-logo.svg"
            width={320}
            height={320}
            alt="better-payment logo"
            className="h-7 w-auto"
          />
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 hidden sm:flex font-mono tracking-tight"
          >
            v2
          </Badge>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/60 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <ThemeToggle />
          <Separator orientation="vertical" className="h-4 mx-1" />
          <a
            href="https://github.com/furkanczay/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-foreground h-8 px-3 text-xs font-medium",
            )}
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "h-8 px-3 text-xs font-medium")}
          >
            npm install
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/60"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-2xl px-5 py-3 flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/60 transition-colors font-medium"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Separator className="my-2.5" />
          <div className="flex gap-2 pb-1">
            <a
              href="https://github.com/furkanczay/better-payment"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "flex-1 justify-center text-xs h-9",
              )}
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/better-payment"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm" }),
                "flex-1 justify-center text-xs h-9",
              )}
            >
              npm install
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
