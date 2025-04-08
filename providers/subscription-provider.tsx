"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { SubscriptionManager_CONTRACT_ADDRESS } from "@/constants";
import { SubscriptionManagerABI } from "@/constants/abis";
import { parseEther, formatEther } from "viem";

interface SubscriptionStatus {
  planId: number;
  expiresAt: bigint;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: bigint;
  formattedPrice: string; // User-friendly price
  duration: bigint;
  isActive: boolean;
}

interface SubscriptionContextType {
  isSubscriptionActive: boolean | undefined;
  subscriptionStatus: SubscriptionStatus | undefined;
  isLoadingStatus: boolean;
  subscribeToPlan: (
    planId: number,
    price: string
  ) => Promise<{ success: boolean; hash?: `0x${string}`; error?: string }>;
  isSubscribing: boolean;
  subscribeError: Error | null;

  // New state for all plans
  allPlans: SubscriptionPlan[] | undefined;
  isLoadingAllPlans: boolean;
  fetchAllPlansError: Error | null;
  fetchAllPlans: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const {
    data: hash,
    error: subscribeError,
    isPending: isSubscribing,
    writeContractAsync,
  } = useWriteContract();

  // State for All Plans
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[] | undefined>(
    undefined
  );
  const [isLoadingAllPlans, setIsLoadingAllPlans] = useState<boolean>(false);
  const [fetchAllPlansError, setFetchAllPlansError] = useState<Error | null>(
    null
  );

  // Read Hooks
  const { data: activeStatusData, isLoading: isLoadingActiveStatus } =
    useReadContract({
      address: SubscriptionManager_CONTRACT_ADDRESS as `0x${string}`,
      abi: SubscriptionManagerABI,
      functionName: "isSubscriptionActive",
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    });

  const { data: subscriptionStatusData, isLoading: isLoadingSubStatus } =
    useReadContract({
      address: SubscriptionManager_CONTRACT_ADDRESS as `0x${string}`,
      abi: SubscriptionManagerABI,
      functionName: "getSubscriptionStatus",
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    });

  // Get nextPlanId for knowing how many plans exist
  const { data: nextPlanIdData } = useReadContract({
    address: SubscriptionManager_CONTRACT_ADDRESS as `0x${string}`,
    abi: SubscriptionManagerABI,
    functionName: "nextPlanId",
    query: {
      enabled: isConnected,
    },
  });

  // Format subscription status
  const subscriptionStatus = useMemo(() => {
    if (subscriptionStatusData) {
      const [planId, expiresAt] = subscriptionStatusData as [bigint, bigint];
      return { planId: Number(planId), expiresAt };
    }
    return undefined;
  }, [subscriptionStatusData]);

  // Write Function
  const subscribeToPlan = async (
    planId: number,
    price: string
  ): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> => {
    if (!isConnected || !address) {
      return { success: false, error: "Wallet not connected" };
    }
    try {
      const txHash = await writeContractAsync({
        address: SubscriptionManager_CONTRACT_ADDRESS as `0x${string}`,
        abi: SubscriptionManagerABI,
        functionName: "subscribe",
        args: [BigInt(planId)],
        value: parseEther(price),
      });
      return { success: true, hash: txHash };
    } catch (err: any) {
      console.error("Subscription failed:", err);
      return {
        success: false,
        error: err.shortMessage || err.message || "Subscription failed",
      };
    }
  };

  // Function to Fetch All Plans
  const fetchAllPlans = useCallback(async (): Promise<void> => {
    if (!isConnected || !publicClient) {
      setFetchAllPlansError(
        new Error("Wallet not connected or client not available")
      );
      return;
    }

    setIsLoadingAllPlans(true);
    setFetchAllPlansError(null);
    setAllPlans(undefined); // Clear previous plans

    try {
      const numPlans = nextPlanIdData ? Number(nextPlanIdData) : 0;
      if (numPlans === 0) {
        setAllPlans([]);
        return;
      }

      const plans: SubscriptionPlan[] = [];

      // Fetch details for each plan
      for (let i = 0; i < numPlans; i++) {
        try {
          const result = await publicClient.readContract({
            address: SubscriptionManager_CONTRACT_ADDRESS as `0x${string}`,
            abi: SubscriptionManagerABI,
            functionName: "getPlanDetails",
            args: [BigInt(i)],
          });

          // Type assertion for the contract result (tuple format from Solidity)
          const typedResult = result as [
            bigint,
            string,
            bigint,
            bigint,
            boolean,
          ];

          plans.push({
            id: Number(typedResult[0]),
            name: typedResult[1],
            price: typedResult[2],
            formattedPrice: formatEther(typedResult[2]),
            duration: typedResult[3],
            isActive: typedResult[4],
          });
        } catch (error) {
          console.error(`Error fetching plan ${i}:`, error);
          // Continue with other plans even if one fails
        }
      }

      setAllPlans(plans);
    } catch (err: any) {
      console.error("Error fetching all plans:", err);
      setFetchAllPlansError(
        err instanceof Error ? err : new Error(String(err))
      );
      setAllPlans([]);
    } finally {
      setIsLoadingAllPlans(false);
    }
  }, [isConnected, publicClient, nextPlanIdData]);

  // Transaction Receipt Hook
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Context Value
  const value = useMemo(
    () => ({
      isSubscriptionActive: activeStatusData as boolean | undefined,
      subscriptionStatus,
      isLoadingStatus: isLoadingActiveStatus || isLoadingSubStatus,
      subscribeToPlan,
      isSubscribing: isSubscribing || isConfirming,
      subscribeError,
      allPlans,
      isLoadingAllPlans,
      fetchAllPlansError,
      fetchAllPlans,
    }),
    [
      activeStatusData,
      subscriptionStatus,
      isLoadingActiveStatus,
      isLoadingSubStatus,
      subscribeToPlan,
      isSubscribing,
      isConfirming,
      subscribeError,
      allPlans,
      isLoadingAllPlans,
      fetchAllPlansError,
      fetchAllPlans,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom Hook
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
