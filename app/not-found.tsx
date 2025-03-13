"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

export default function NotFound() {
  // Generate random bubble properties once when component mounts
  const bubbles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 2,
    }));
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 dark:bg-grid-small-white bg-grid-small-black -z-10 opacity-[0.2]" />

      {/* Animated bubbles in the background */}
      <div className="absolute top-0 left-0 w-full h-full -z-5 overflow-hidden">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10 dark:bg-primary/5"
            style={{
              width: `${bubble.width}px`,
              height: `${bubble.height}px`,
              top: `${bubble.top}%`,
              left: `${bubble.left}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: bubble.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        className="max-w-2xl mx-auto text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <span className="inline-block relative">
            <span className="text-9xl font-bold tracking-tighter text-gradient bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-purple-400">
              404
            </span>
            <motion.div
              className="absolute -top-1 -right-6"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-5xl">✨</span>
            </motion.div>
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold tracking-tighter mb-3"
        >
          Oops! Page not found
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-muted-foreground mb-8 text-lg"
        >
          We've looked everywhere, but this page seems to have gone on an
          adventure!
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="font-medium rounded-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="font-medium rounded-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </motion.div>

        {/* Fun easter egg */}
        <motion.div variants={itemVariants} className="mt-12 opacity-80">
          <Image
            src="https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?q=80&w=300&auto=format&fit=crop"
            alt="Cute confused robot"
            width={120}
            height={120}
            className="mx-auto rounded-full shadow-lg"
          />
          <p className="text-sm mt-3 text-muted-foreground">
            "I think I took a wrong turn somewhere..."
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
