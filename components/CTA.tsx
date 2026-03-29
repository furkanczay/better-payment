import { ArrowRight, ExternalLink } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-indigo-600 to-violet-700">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to simplify payments?
        </h2>
        <p className="mt-4 text-indigo-200 text-lg">
          Join developers who stopped duplicating payment logic across providers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a
            href="#quickstart"
            className="flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/furkanczay/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-indigo-500/30 border border-indigo-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
