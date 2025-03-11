"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LandingHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, to handle theme changes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a simple placeholder during server rendering or before client hydration
  if (!mounted) {
    return (
      <section
        className="w-full py-24 md:py-32 relative overflow-hidden"
        id="hero"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Learn With AI
                <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Personal Tutor
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Upload your study materials and let our AI tutor teach you with
                an interactive whiteboard experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="rounded-full font-medium">
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-medium"
                >
                  See Demo
                </Button>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-md lg:max-w-none h-[400px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-foreground/10 shadow-xl">
                {/* Server-side safe image placeholder */}
                <div className="absolute inset-0 bg-muted animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-foreground/10 pt-12">
            <div className="text-center">
              <div className="font-bold text-3xl mb-2">2M+</div>
              <p className="text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl mb-2">150+</div>
              <p className="text-muted-foreground">Subjects</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl mb-2">92%</div>
              <p className="text-muted-foreground">Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl mb-2">24/7</div>
              <p className="text-muted-foreground">Availability</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isDark = theme === "dark";

  return (
    <section
      className="w-full py-24 md:py-32 relative overflow-hidden"
      id="hero"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-0 ${isDark ? "opacity-20" : "opacity-10"} bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 blur-3xl h-96 w-full transform -translate-y-1/2`}
        ></div>
      </div>

      {/* Grid decoration */}
      <div className="absolute inset-0 bg-grid-small-white/[0.2] bg-grid-small-black/[0.06] -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Learn With AI
              <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                Personal Tutor
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Upload your study materials and let our AI tutor teach you with an
              interactive whiteboard experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full font-medium">
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-medium"
              >
                See Demo
              </Button>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-md lg:max-w-none h-[400px]">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-foreground/10 shadow-xl">
              <Image
                src={
                  isDark
                    ? "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1236&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1470&auto=format&fit=crop"
                }
                alt="AI Teaching Interface"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-foreground/10 pt-12">
          <div className="text-center">
            <div className="font-bold text-3xl mb-2">2M+</div>
            <p className="text-muted-foreground">Students</p>
          </div>
          <div className="text-center">
            <div className="font-bold text-3xl mb-2">150+</div>
            <p className="text-muted-foreground">Subjects</p>
          </div>
          <div className="text-center">
            <div className="font-bold text-3xl mb-2">92%</div>
            <p className="text-muted-foreground">Satisfaction</p>
          </div>
          <div className="text-center">
            <div className="font-bold text-3xl mb-2">24/7</div>
            <p className="text-muted-foreground">Availability</p>
          </div>
        </div>
      </div>
    </section>
  );
}
