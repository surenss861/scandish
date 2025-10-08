import React from "react";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$19/mo",
      features: ["1 Menu", "QR Code Included", "Basic Support"],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$39/mo",
      features: [
        "Unlimited Menus",
        "Custom Branding",
        "Daily Specials",
        "Priority Support",
      ],
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Simple Pricing for Restaurants
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Start small or scale your restaurant with flexible plans.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl border shadow-lg p-8 transition hover:scale-105 ${
                plan.highlighted
                  ? "border-red-600 shadow-red-200 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="text-4xl font-bold mt-4">{plan.price}</p>
              <ul className="mt-6 space-y-3 text-gray-700">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center justify-center gap-2">
                    ✅ {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className={`mt-8 inline-block px-6 py-3 rounded-lg font-medium shadow ${
                  plan.highlighted
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Choose {plan.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
