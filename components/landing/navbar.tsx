"use client";
import Link from "next/link";
import React from "react";
import { ThemeSwitcher } from "../theme-switcher";
import { AIConnectWalletComponent } from "../ai-connect-wallet-component";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 sticky top-0 z-50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            AI Teaching
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/blog"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            About Us
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <AIConnectWalletComponent variant="outline" size="sm" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
