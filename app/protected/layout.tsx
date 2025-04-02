"use client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { AIConnectWalletComponent } from "@/components/ai-connect-wallet-component";
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

          <div className="flex items-center gap-4">
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
            <AIConnectWalletComponent variant="outline" size="sm" />
          </div>
        </div>
      </nav>

      {/* Main content */}
      {children}

      {/* No footer in protected routes as requested */}
    </>
  );
}
