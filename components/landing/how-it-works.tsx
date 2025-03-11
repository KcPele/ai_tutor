"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload Your Materials",
    description:
      "Upload your PDF study materials, textbooks, or notes to the platform.",
  },
  {
    number: "02",
    title: "AI Processes Content",
    description:
      "Our AI analyzes your content, identifying key concepts and learning objectives.",
  },
  {
    number: "03",
    title: "Interactive Teaching Session",
    description:
      "Start a teaching session where the AI explains concepts using the whiteboard.",
  },
  {
    number: "04",
    title: "Ask Questions & Learn",
    description:
      "Ask questions and get real-time explanations for deeper understanding.",
  },
];

export default function HowItWorks() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side and initial client render until hydration is complete
  if (!mounted) {
    return (
      <section className="w-full py-24 bg-muted/50" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple four-step process to transform your study materials into
              interactive learning sessions.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-foreground/10 hidden md:block transform -translate-x-1/2"></div>

            <div className="space-y-12 relative z-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 text-center md:text-left">
                    <div className="mb-4 bg-primary/10 dark:bg-primary/20 text-primary rounded-full inline-flex items-center justify-center w-12 h-12 font-bold">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  <div className="flex-1 relative rounded-2xl overflow-hidden h-[250px] shadow-lg border border-foreground/5">
                    {/* Server-side safe image placeholder */}
                    <div className="absolute inset-0 bg-muted animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70"></div>

                    {/* Step indicator circle for desktop */}
                    <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 hidden md:block">
                      <div
                        className={`absolute ${
                          index % 2 === 0
                            ? "right-0 translate-x-1/2"
                            : "left-0 -translate-x-1/2"
                        } w-5 h-5 rounded-full bg-primary shadow-md`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-16">
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <span>Ready to transform your learning experience</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isDark = theme === "dark";

  return (
    <section className="w-full py-24 bg-muted/50" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple four-step process to transform your study materials into
            interactive learning sessions.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-foreground/10 hidden md:block transform -translate-x-1/2"></div>

          <div className="space-y-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4 bg-primary/10 dark:bg-primary/20 text-primary rounded-full inline-flex items-center justify-center w-12 h-12 font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                <div className="flex-1 relative rounded-2xl overflow-hidden h-[250px] shadow-lg border border-foreground/5">
                  <Image
                    src={
                      isDark
                        ? `https://images.unsplash.com/photo-1597733336794-12d05021d510?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D${index}`
                        : `https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D${index}`
                    }
                    alt={`Step ${index + 1}: ${step.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70"></div>

                  {/* Step indicator circle for desktop */}
                  <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 hidden md:block">
                    <div
                      className={`absolute ${
                        index % 2 === 0
                          ? "right-0 translate-x-1/2"
                          : "left-0 -translate-x-1/2"
                      } w-5 h-5 rounded-full bg-primary shadow-md`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-16">
            <div className="inline-flex items-center gap-2 text-primary font-medium">
              <span>Ready to transform your learning experience</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
