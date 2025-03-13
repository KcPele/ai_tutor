"use client";

import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const ClientNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 sticky top-0 z-50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            AI Teaching
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/#features"
            className="hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex gap-2">
            <Button asChild size="sm" variant={"outline"}>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm" variant={"default"}>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-b-foreground/10 z-50 py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <Link
              href="/#features"
              className="py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="py-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/blog"
              className="py-2 font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="py-2 font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" variant={"outline"} className="flex-1">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant={"default"} className="flex-1">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ClientNavbar;
