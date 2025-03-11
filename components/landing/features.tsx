"use client";

import { BookOpen, Upload, Sparkles, PenTool } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-blue-500" />,
    title: "AI Tutor",
    description:
      "Learn from a personalized AI tutor that adapts to your learning style and pace.",
  },
  {
    icon: <Upload className="h-8 w-8 text-purple-500" />,
    title: "Material Upload",
    description:
      "Upload PDFs and documents, which our AI processes to create tailored learning content.",
  },
  {
    icon: <PenTool className="h-8 w-8 text-green-500" />,
    title: "Interactive Whiteboard",
    description:
      "Watch the AI explain concepts on a dynamic whiteboard with real-time annotations.",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-amber-500" />,
    title: "Conversational Learning",
    description:
      "Ask questions and get instant explanations in an interactive conversation.",
  },
];

export default function Features() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a consistent server-side and client-side render until hydration is complete
  if (!mounted) {
    return (
      <section className="w-full py-24 relative" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Learning Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for an immersive learning experience powered
              by artificial intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden border border-foreground/10 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-2xl"></div>
              {/* Server-side safe image placeholder */}
              <div className="absolute inset-0 bg-muted animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col p-6 rounded-xl bg-card border border-foreground/5 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="mb-4 p-2 rounded-lg bg-background inline-flex items-center justify-center w-12 h-12 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isDark = theme === "dark";

  return (
    <section className="w-full py-24 relative" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Learning Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for an immersive learning experience powered by
            artificial intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative h-[500px] rounded-2xl overflow-hidden border border-foreground/10 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-2xl"></div>
            <Image
              src={
                isDark
                  ? "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=800&auto=format&fit=crop"
                  : "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop"
              }
              alt="AI Teaching Features"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col p-6 rounded-xl bg-card border border-foreground/5 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="mb-4 p-2 rounded-lg bg-background inline-flex items-center justify-center w-12 h-12 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
