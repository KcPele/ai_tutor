"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out the platform",
    features: [
      "3 PDF uploads per month",
      "Basic AI tutoring",
      "Standard whiteboard functionality",
      "24-hour chat history",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "19",
    description: "For students serious about their education",
    features: [
      "Unlimited PDF uploads",
      "Advanced AI tutoring",
      "Enhanced whiteboard interactions",
      "Unlimited chat history",
      "Priority support",
      "Study progress tracking",
    ],
    cta: "Start Pro Plan",
    popular: true,
  },
  {
    name: "Team",
    price: "49",
    description: "For educators and study groups",
    features: [
      "Everything in Pro",
      "Up to 5 user accounts",
      "Collaborative whiteboards",
      "Custom teaching materials",
      "Advanced analytics",
      "API access",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side and initial client render
  if (!mounted) {
    return (
      <section className="w-full py-24 bg-muted/50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your learning needs.
            </p>

            <div className="mt-8 inline-flex items-center p-1 bg-muted border border-foreground/10 rounded-full">
              <button className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-background text-foreground shadow-sm">
                Monthly
              </button>
              <button className="px-4 py-2 rounded-full text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                Yearly{" "}
                <span className="text-xs text-emerald-500 font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              return (
                <div
                  key={index}
                  className={`rounded-xl ${
                    plan.popular
                      ? "ring-2 ring-primary shadow-lg"
                      : "border border-foreground/10"
                  } bg-card p-8 flex flex-col h-full relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price !== "0" && (
                        <span className="text-muted-foreground ml-2">
                          /month
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? ""
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-card border border-foreground/10 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Enterprise Solutions</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Need a custom solution for your school or organization? Contact
              our sales team for a personalized plan.
            </p>
            <Button variant="outline" size="lg">
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-24 bg-muted/50" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for your learning needs.
          </p>

          <div className="mt-8 inline-flex items-center p-1 bg-muted border border-foreground/10 rounded-full">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly{" "}
              <span className="text-xs text-emerald-500 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const price =
              billingPeriod === "yearly"
                ? Math.round(parseInt(plan.price) * 0.8 * 12).toString()
                : plan.price;

            return (
              <div
                key={index}
                className={`rounded-xl ${
                  plan.popular
                    ? "ring-2 ring-primary shadow-lg"
                    : "border border-foreground/10"
                } bg-card p-8 flex flex-col h-full relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${price}</span>
                    {plan.price !== "0" && (
                      <span className="text-muted-foreground ml-2">
                        /{billingPeriod === "yearly" ? "year" : "month"}
                      </span>
                    )}
                  </div>
                  {plan.price !== "0" && billingPeriod === "yearly" && (
                    <p className="text-sm text-emerald-500 mt-1">
                      ${Math.round(parseInt(plan.price) * 12)} value
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? ""
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-card border border-foreground/10 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Enterprise Solutions</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Need a custom solution for your school or organization? Contact our
            sales team for a personalized plan.
          </p>
          <Button variant="outline" size="lg">
            Contact Enterprise Sales
          </Button>
        </div>
      </div>
    </section>
  );
}
