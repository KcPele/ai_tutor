"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function CallToAction() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side and initial client render
  if (!mounted) {
    return (
      <section className="w-full py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of students who have discovered a better way to
              learn with our AI-powered teaching platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full font-medium gap-2 group"
              >
                Get Started Today
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-medium"
              >
                Watch Tutorial
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-bold text-2xl mb-2 text-primary">
                30-Day Free Trial
              </div>
              <p className="text-muted-foreground">
                Try all Pro features for free, no credit card required.
              </p>
            </div>
            <div>
              <div className="font-bold text-2xl mb-2 text-primary">
                100% Satisfaction
              </div>
              <p className="text-muted-foreground">
                Not satisfied? Get a full refund within 30 days.
              </p>
            </div>
            <div>
              <div className="font-bold text-2xl mb-2 text-primary">
                24/7 Support
              </div>
              <p className="text-muted-foreground">
                Our team is always here to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isDark = theme === "dark";

  return (
    <section className="w-full py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute bottom-0 ${isDark ? "opacity-20" : "opacity-10"} bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 blur-3xl h-96 w-full transform translate-y-1/2`}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students who have discovered a better way to learn
            with our AI-powered teaching platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full font-medium gap-2 group">
              Get Started Today
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-medium"
            >
              Watch Tutorial
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-bold text-2xl mb-2 text-primary">
              30-Day Free Trial
            </div>
            <p className="text-muted-foreground">
              Try all Pro features for free, no credit card required.
            </p>
          </div>
          <div>
            <div className="font-bold text-2xl mb-2 text-primary">
              100% Satisfaction
            </div>
            <p className="text-muted-foreground">
              Not satisfied? Get a full refund within 30 days.
            </p>
          </div>
          <div>
            <div className="font-bold text-2xl mb-2 text-primary">
              24/7 Support
            </div>
            <p className="text-muted-foreground">
              Our team is always here to help you succeed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
