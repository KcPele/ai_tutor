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
import { ContentFeedback_CONTRACT_ADDRESS } from "@/constants";
import { ContentFeedbackABI } from "@/constants/abis";

interface FeedbackDetails {
  user: `0x${string}`;
  contentIdentifier: string;
  rating: number;
  comment: string;
  timestamp: bigint;
}

interface ContentFeedbackContextType {
  // Read States
  userFeedbackCount: number | undefined;
  isLoadingUserFeedbackCount: boolean;
  userFeedbackIds: readonly bigint[] | undefined;
  isLoadingUserFeedbackIds: boolean;

  // Write States & Function
  submitFeedback: (
    contentIdentifier: string,
    rating: number,
    comment: string
  ) => Promise<{ success: boolean; hash?: `0x${string}`; error?: string }>;
  isSubmittingFeedback: boolean;
  submitFeedbackError: Error | null;

  // Session details
  getFeedbackDetailsById: (
    feedbackId: bigint
  ) => Promise<FeedbackDetails | null>;
  isLoadingFeedbackDetails: boolean;
}

const ContentFeedbackContext = createContext<
  ContentFeedbackContextType | undefined
>(undefined);

export const ContentFeedbackProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const {
    data: submitHash,
    error: submitFeedbackError,
    isPending: isSubmitPending,
    writeContractAsync,
  } = useWriteContract();

  // State for loading specific feedback details
  const [isLoadingFeedbackDetails, setIsLoadingFeedbackDetails] =
    useState(false);

  // Read Hooks
  const { data: countData, isLoading: isLoadingUserFeedbackCount } =
    useReadContract({
      address: ContentFeedback_CONTRACT_ADDRESS as `0x${string}`,
      abi: ContentFeedbackABI,
      functionName: "getUserFeedbackCount",
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    });

  const { data: idsData, isLoading: isLoadingUserFeedbackIds } =
    useReadContract({
      address: ContentFeedback_CONTRACT_ADDRESS as `0x${string}`,
      abi: ContentFeedbackABI,
      functionName: "getAllUserFeedbackIds",
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    });

  // Write Function
  const submitFeedback = useCallback(
    async (
      contentIdentifier: string,
      rating: number,
      comment: string
    ): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> => {
      if (!isConnected || !address) {
        return { success: false, error: "Wallet not connected" };
      }

      // Input validation
      if (rating < 1 || rating > 5) {
        return { success: false, error: "Rating must be between 1 and 5" };
      }

      if (!contentIdentifier?.trim()) {
        return { success: false, error: "Content identifier is required" };
      }

      try {
        const txHash = await writeContractAsync({
          address: ContentFeedback_CONTRACT_ADDRESS as `0x${string}`,
          abi: ContentFeedbackABI,
          functionName: "submitFeedback",
          args: [contentIdentifier, rating, comment],
        });
        return { success: true, hash: txHash };
      } catch (err: any) {
        console.error("Submitting feedback failed:", err);
        const errorMsg =
          err.shortMessage || err.message || "Failed to submit feedback";
        // Improve specific contract revert messages if possible
        if (errorMsg.includes("Rating must be between 1 and 5")) {
          return { success: false, error: "Rating must be between 1 and 5" };
        }
        if (errorMsg.includes("Content identifier required")) {
          return { success: false, error: "Content identifier required" };
        }
        return { success: false, error: errorMsg };
      }
    },
    [isConnected, address, writeContractAsync]
  );

  // Function to fetch specific feedback details directly from the contract
  const getFeedbackDetailsById = useCallback(
    async (feedbackId: bigint): Promise<FeedbackDetails | null> => {
      if (!publicClient) {
        console.error("Public client not available");
        return null;
      }

      setIsLoadingFeedbackDetails(true);
      try {
        const result = await publicClient.readContract({
          address: ContentFeedback_CONTRACT_ADDRESS as `0x${string}`,
          abi: ContentFeedbackABI,
          functionName: "getFeedbackById",
          args: [feedbackId],
        });

        // Type assertion for the contract result (tuple format from Solidity)
        const typedResult = result as [
          `0x${string}`, // user address
          string, // contentIdentifier
          number, // rating
          string, // comment
          bigint, // timestamp
        ];

        setIsLoadingFeedbackDetails(false);
        return {
          user: typedResult[0],
          contentIdentifier: typedResult[1],
          rating: Number(typedResult[2]), // Convert from bigint to number if needed
          comment: typedResult[3],
          timestamp: typedResult[4],
        };
      } catch (err: any) {
        console.error(
          `Error fetching feedback details for ID ${feedbackId}:`,
          err
        );
        setIsLoadingFeedbackDetails(false);
        return null;
      }
    },
    [publicClient]
  );

  // Transaction Receipt Hook
  const { isLoading: isSubmitConfirming } = useWaitForTransactionReceipt({
    hash: submitHash,
  });

  // Context Value
  const value = useMemo(
    () => ({
      userFeedbackCount:
        countData !== undefined ? Number(countData) : undefined,
      isLoadingUserFeedbackCount,
      userFeedbackIds: idsData as readonly bigint[] | undefined,
      isLoadingUserFeedbackIds,
      submitFeedback,
      isSubmittingFeedback: isSubmitPending || isSubmitConfirming,
      submitFeedbackError,
      getFeedbackDetailsById,
      isLoadingFeedbackDetails,
    }),
    [
      countData,
      isLoadingUserFeedbackCount,
      idsData,
      isLoadingUserFeedbackIds,
      submitFeedback,
      isSubmitPending,
      isSubmitConfirming,
      submitFeedbackError,
      getFeedbackDetailsById,
      isLoadingFeedbackDetails,
    ]
  );

  return (
    <ContentFeedbackContext.Provider value={value}>
      {children}
    </ContentFeedbackContext.Provider>
  );
};

// Custom Hook
export const useContentFeedback = (): ContentFeedbackContextType => {
  const context = useContext(ContentFeedbackContext);
  if (context === undefined) {
    throw new Error(
      "useContentFeedback must be used within a ContentFeedbackProvider"
    );
  }
  return context;
};
