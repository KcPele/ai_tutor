"use client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { AIConnectWalletComponent } from "@/components/ai-connect-wallet-component";
import { useAccount } from "wagmi";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnected, isConnecting } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isConnected) {
    redirect("/");
  }

  if (isConnecting) {
    return <div>Connecting...</div>;
  }

  return (
    <>
      {/* Navigation bar remains the same as the root layout */}
      <nav className="w-full border-b border-b-foreground/10 h-16 sticky top-0 z-50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto flex justify-between items-center h-full px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl">
              AI Teaching
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/protected"
              className="hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/protected/teaching"
              className="hover:text-primary transition-colors"
            >
              Learning
            </Link>
            <Link
              href="/protected/profile"
              className="hover:text-primary transition-colors"
            >
              Profile
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

            <div className="hidden md:block">
              <AIConnectWalletComponent variant="outline" size="sm" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-b-foreground/10 z-50 py-4 px-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link
                href="/protected"
                className="py-2 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/protected/teaching"
                className="py-2 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learning
              </Link>
              <Link
                href="/protected/profile"
                className="py-2 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <div className="pt-2">
                <AIConnectWalletComponent variant="outline" size="sm" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      {children}

      {/* No footer in protected routes as requested */}
    </>
  );
}
