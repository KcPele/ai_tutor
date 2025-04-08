"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { AchievementNFT_CONTRACT_ADDRESS } from "@/constants";
import { AchievementNFTABI } from "@/constants/abis";

// --- Interfaces ---
interface AchievementDetails {
  tokenId: bigint;
  tokenUri: string | null;
  achievementTypeId: number | null; // uint256 -> number
  achievementDescription: string | null;
}

interface AchievementContextType {
  // Read States
  achievementBalance: number | undefined; // User's NFT count
  isLoadingBalance: boolean;
  tokenIds: readonly bigint[] | undefined; // List of token IDs owned by the user
  isLoadingTokenIds: boolean;

  // On-Demand Read Functions
  fetchOwnedTokenIds: () => Promise<void>; // Function to explicitly trigger fetching IDs
  getAchievementDetails: (
    tokenId: bigint
  ) => Promise<Omit<AchievementDetails, "tokenId"> | null>; // Fetches URI, Type ID, Description
  isLoadingDetails: boolean; // Loading state for getAchievementDetails

  // User Write Functions (Approve/Transfer)
  approveNFT: (
    to: `0x${string}`,
    tokenId: bigint
  ) => Promise<{ success: boolean; hash?: `0x${string}`; error?: string }>;
  transferNFT: (
    to: `0x${string}`,
    tokenId: bigint
  ) => Promise<{ success: boolean; hash?: `0x${string}`; error?: string }>;
  isTransferring: boolean;
  transferError: Error | null;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const {
    data: hash,
    error: transferError,
    isPending: isTransferPending,
    writeContractAsync,
  } = useWriteContract();

  // State for owned token IDs and specific detail loading
  const [tokenIds, setTokenIds] = useState<readonly bigint[] | undefined>(
    undefined
  );
  const [isLoadingTokenIds, setIsLoadingTokenIds] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // Loading state for getAchievementDetails

  // --- Read Hooks ---

  // Fetch user's NFT balance
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: AchievementNFTABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // --- Generic Read Hook Instance (for on-demand reads) ---
  const { refetch: readContract } = useReadContract({
    address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: AchievementNFTABI,
    functionName: "name", // Use a simple read function like 'name' or 'symbol'
    query: {
      enabled: false, // Disable automatic fetching
    },
  });

  // --- Function to Fetch Owned Token IDs ---
  const fetchOwnedTokenIds = useCallback(async () => {
    // Refetch balance first to ensure it's up-to-date
    const balanceResult = await refetchBalance();
    const currentBalance = balanceResult.data;

    if (
      !isConnected ||
      !address ||
      currentBalance === undefined ||
      currentBalance === BigInt(0)
    ) {
      setTokenIds([]); // Set empty if not connected or balance is zero
      return;
    }

    setIsLoadingTokenIds(true);
    setTokenIds(undefined); // Clear previous IDs

    try {
      const numBalance = Number(currentBalance);
      const promises: Promise<bigint | null>[] = []; // Allow null for potential errors

      for (let i = 0; i < numBalance; i++) {
        promises.push(
          // Using any here to bypass TypeScript error with refetch
          (readContract as any)({
            address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: AchievementNFTABI,
            functionName: "tokenOfOwnerByIndex",
            args: [address, BigInt(i)],
          })
            .then((result: any) => {
              if (result.status === "success" && result.data !== undefined) {
                return result.data as bigint;
              } else {
                console.warn(`Failed to fetch token ID at index ${i}`);
                return null; // Indicate failure for this specific index
              }
            })
            .catch((err: any) => {
              console.error(`Error fetching token ID at index ${i}:`, err);
              return null; // Handle promise rejection
            })
        );
      }

      const fetchedIdsResults = await Promise.all(promises);
      // Filter out any nulls that occurred during fetching
      const validFetchedIds = fetchedIdsResults.filter(
        (id): id is bigint => id !== null
      );
      setTokenIds(validFetchedIds);
    } catch (error) {
      console.error("Error fetching owned token IDs:", error);
      setTokenIds([]); // Reset to empty on error
    } finally {
      setIsLoadingTokenIds(false);
    }
  }, [isConnected, address, readContract, refetchBalance]);

  // Optional: Fetch token IDs automatically when balance changes or user connects
  useEffect(() => {
    if (isConnected && address && balanceData !== undefined) {
      fetchOwnedTokenIds();
    } else {
      // Clear token IDs if user disconnects or has no balance initially
      setTokenIds(undefined);
    }
  }, [isConnected, address, balanceData, fetchOwnedTokenIds]); // Rerun when balance might change

  // --- Function to Fetch All Details for a Specific Token ID ---
  const getAchievementDetails = useCallback(
    async (
      tokenId: bigint
    ): Promise<Omit<AchievementDetails, "tokenId"> | null> => {
      setIsLoadingDetails(true);
      try {
        // Fetch URI, Type ID, and Description concurrently
        const [uriResult, typeIdResult] = await Promise.all([
          // Using any here to bypass TypeScript error with refetch
          (readContract as any)({
            address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: AchievementNFTABI,
            functionName: "tokenURI",
            args: [tokenId],
          }),
          (readContract as any)({
            address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: AchievementNFTABI,
            functionName: "getTokenAchievementType",
            args: [tokenId],
          }),
        ]);

        let tokenUri: string | null = null;
        let achievementTypeId: number | null = null;
        let achievementDescription: string | null = null;

        if (uriResult.status === "success" && uriResult.data) {
          tokenUri = uriResult.data as string;
        } else {
          console.warn(`Failed to fetch URI for token ${tokenId}`);
        }

        if (
          typeIdResult.status === "success" &&
          typeIdResult.data !== undefined
        ) {
          const typeIdBigInt = typeIdResult.data as bigint;
          achievementTypeId = Number(typeIdBigInt); // Convert uint256 to number

          // Now fetch the description based on the type ID
          const descResult = await (readContract as any)({
            address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: AchievementNFTABI,
            functionName: "getAchievementTypeDescription",
            args: [typeIdBigInt], // Use the bigint ID here
          });
          if (descResult.status === "success" && descResult.data) {
            achievementDescription = descResult.data as string;
          } else {
            console.warn(
              `Failed to fetch description for type ID ${achievementTypeId}`
            );
          }
        } else {
          console.warn(`Failed to fetch type ID for token ${tokenId}`);
        }

        setIsLoadingDetails(false);
        // Return null only if essential info (like typeId) couldn't be fetched
        if (achievementTypeId === null) return null;

        return {
          tokenUri,
          achievementTypeId,
          achievementDescription,
        };
      } catch (error) {
        console.error(`Error fetching details for token ID ${tokenId}:`, error);
        setIsLoadingDetails(false);
        return null;
      }
    },
    [readContract]
  ); // Dependency: readContract function instance

  // --- Write Functions ---
  const approveNFT = useCallback(
    async (
      to: `0x${string}`,
      tokenId: bigint
    ): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> => {
      if (!isConnected || !address) {
        return { success: false, error: "Wallet not connected" };
      }
      try {
        const txHash = await writeContractAsync({
          address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: AchievementNFTABI,
          functionName: "approve",
          args: [to, tokenId],
        });
        return { success: true, hash: txHash };
      } catch (err: any) {
        console.error("Approval failed:", err);
        return {
          success: false,
          error: err.shortMessage || err.message || "Approval failed",
        };
      }
    },
    [isConnected, address, writeContractAsync]
  );

  const transferNFT = useCallback(
    async (
      to: `0x${string}`,
      tokenId: bigint
    ): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> => {
      if (!isConnected || !address) {
        return { success: false, error: "Wallet not connected" };
      }
      try {
        const txHash = await writeContractAsync({
          address: AchievementNFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: AchievementNFTABI,
          functionName: "transferFrom",
          args: [address, to, tokenId],
        });
        return { success: true, hash: txHash };
      } catch (err: any) {
        console.error("Transfer failed:", err);
        return {
          success: false,
          error: err.shortMessage || err.message || "Transfer failed",
        };
      }
    },
    [isConnected, address, writeContractAsync]
  );

  // Transaction Receipt Hook
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // --- Context Value ---
  const value = useMemo(
    () => ({
      achievementBalance:
        balanceData !== undefined ? Number(balanceData) : undefined,
      isLoadingBalance,
      tokenIds,
      isLoadingTokenIds,
      fetchOwnedTokenIds,
      getAchievementDetails,
      isLoadingDetails,
      approveNFT,
      transferNFT,
      isTransferring: isTransferPending || isConfirming,
      transferError,
    }),
    [
      balanceData,
      isLoadingBalance,
      tokenIds,
      isLoadingTokenIds,
      fetchOwnedTokenIds,
      getAchievementDetails,
      isLoadingDetails,
      approveNFT,
      transferNFT,
      isTransferPending,
      isConfirming,
      transferError,
    ]
  );

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

// --- Custom Hook ---
export const useAchievementNFT = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error(
      "useAchievementNFT must be used within an AchievementProvider"
    );
  }
  return context;
};
