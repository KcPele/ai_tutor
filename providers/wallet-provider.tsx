"use client";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "next-themes";

// Define chain directly to avoid possible circular imports
const openCampusCodex = defineChain({
  id: 656476,
  name: "Open Campus Codex",
  nativeCurrency: {
    name: "EDU",
    symbol: "EDU",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
    public: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Scout",
      url: "https://opencampus-codex.blockscout.com/",
    },
  },
  testnet: true,
});

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

// Create wagmi config outside of the component
const config = createConfig({
  chains: [openCampusCodex],
  transports: {
    [openCampusCodex.id]: http(),
  },
  connectors: [injected()],
});

// Simple ClientOnly wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}

// Theme-aware RainbowKit provider
function RainbowKitProviderWithTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <RainbowKitProvider
      theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
      coolMode
    >
      {children}
    </RainbowKitProvider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProviderWithTheme>{children}</RainbowKitProviderWithTheme>
        </QueryClientProvider>
      </WagmiProvider>
    </ClientOnly>
  );
}
