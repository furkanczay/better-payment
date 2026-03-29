import { ArrowRight, ExternalLink } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Open Source · TypeScript · Node.js 20+
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight max-w-3xl">
            One API for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              all payment gateways
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl leading-relaxed">
            <strong className="text-slate-700">better-payment</strong> unifies İyzico, PayTR, and
            Parampos under a single, type-safe API. Stop rewriting payment logic — write it once.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href="#quickstart"
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/furkanczay/better-payment"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4" /> GitHub
            </a>
          </div>

          <div className="mt-6 bg-slate-900 text-slate-100 rounded-2xl px-6 py-4 font-mono text-sm shadow-xl w-full max-w-md text-left">
            <span className="text-slate-500 select-none">$ </span>
            <span className="text-green-400">npm</span>{" "}
            <span className="text-white">install better-payment</span>
          </div>
        </div>
      </div>
    </section>
  );
}
