import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { WalletProvider } from "@/providers/wallet-provider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "AI Teaching App - Learn with AI",
  description:
    "Interactive learning platform powered by AI that teaches based on your materials",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <head>
        {/* PDF.js worker is now disabled in the code, so no need for setup script */}
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <main className="min-h-screen flex flex-col">{children}</main>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
