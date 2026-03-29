const providers = [
  {
    name: "İyzico",
    logo: "IY",
    color: "from-orange-500 to-red-500",
    features: [
      "V2 Authorization",
      "Checkout Form",
      "Subscription Payments",
      "Installment Inquiry",
    ],
  },
  {
    name: "PayTR",
    logo: "PT",
    color: "from-blue-500 to-cyan-500",
    features: [
      "Card Payments",
      "3D Secure",
      "Hosted Checkout",
      "Installments",
    ],
  },
  {
    name: "Parampos",
    logo: "PP",
    color: "from-green-500 to-emerald-500",
    features: [
      "SOAP API",
      "3D Secure",
      "Installments",
      "Refund & Cancellation",
    ],
  },
];

export default function Providers() {
  return (
    <section id="providers" className="py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Supported Providers
          </h2>
          <p className="mt-3 text-slate-500 text-lg max-w-xl mx-auto">
            Leading Turkish payment gateways, all under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {p.logo}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
              </div>
              <ul className="space-y-2">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
