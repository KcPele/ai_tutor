import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import HeaderAuth from "@/components/header-auth";

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
            {!hasEnvVars ? null : <HeaderAuth />}
          </div>
        </div>
      </nav>

      {/* Main content */}
      {children}

      {/* No footer in protected routes as requested */}
    </>
  );
}
