"use client";

import { useState } from "react";
import { Menu, X, Package } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Providers", href: "#providers" },
  { label: "Quick Start", href: "#quickstart" },
  { label: "Docs", href: "https://github.com/furkanczay/better-payment#readme", external: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 font-bold text-slate-900">
          <Package className="w-5 h-5 text-indigo-600" />
          <span>better-payment</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="https://www.npmjs.com/package/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            npm install
          </a>
        </div>

        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-700 hover:text-indigo-600"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-700 hover:text-indigo-600"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="https://www.npmjs.com/package/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg text-center hover:bg-indigo-700 transition-colors"
          >
            npm install
          </a>
        </div>
      )}
    </header>
  );
}
