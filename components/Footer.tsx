import { Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Package className="w-4 h-4 text-indigo-400" />
          better-payment
        </div>

        <div className="flex items-center gap-6 text-sm">
          <a
            href="https://www.npmjs.com/package/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            npm
          </a>
          <a
            href="https://github.com/furkanczay/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/furkanczay/better-payment/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Issues
          </a>
        </div>

        <p className="text-xs text-slate-600">
          MIT License · Open Source
        </p>
      </div>
    </footer>
  );
}
