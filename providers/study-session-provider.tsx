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
import { StudySessionLogger_CONTRACT_ADDRESS } from "@/constants";
import { StudySessionLoggerABI } from "@/constants/abis";

interface SessionLog {
  user: `0x${string}`;
  materialIdentifier: string;
  startTimestamp: bigint;
}

interface StudySessionContextType {
  // Read States
  userSessionCount: number | undefined;
  isLoadingUserSessionCount: boolean;
  userSessionIds: readonly bigint[] | undefined;
  isLoadingUserSessionIds: boolean;

  // Write States & Function
  logSessionStart: (
    materialIdentifier: string
  ) => Promise<{ success: boolean; hash?: `0x${string}`; error?: string }>;
  isLoggingSession: boolean;
  logSessionError: Error | null;

  // Session details
  getSessionDetails: (sessionId: bigint) => Promise<SessionLog | null>;
  isLoadingSessionDetails: boolean;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(
  undefined
);

export const StudySessionProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const {
    data: logHash,
    error: logSessionError,
    isPending: isLogPending,
    writeContractAsync,
  } = useWriteContract();

  // State for loading specific session details
  const [isLoadingSessionDetails, setIsLoadingSessionDetails] = useState(false);

  // Read Hooks
  const { data: countData, isLoading: isLoadingUserSessionCount } =
    useReadContract({
      address: StudySessionLogger_CONTRACT_ADDRESS as `0x${string}`,
      abi: StudySessionLoggerABI,
      functionName: "getUserSessionCount",
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    });

  const { data: idsData, isLoading: isLoadingUserSessionIds } = useReadContract(
    {
      address: StudySessionLogger_CONTRACT_ADDRESS as `0x${string}`,
      abi: StudySessionLoggerABI,
      functionName: "getAllUserSessions",
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    }
  );

  // Write Function
  const logSessionStart = useCallback(
    async (
      materialIdentifier: string
    ): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> => {
      if (!isConnected || !address) {
        return { success: false, error: "Wallet not connected" };
      }
      if (!materialIdentifier?.trim()) {
        return { success: false, error: "Material identifier cannot be empty" };
      }

      try {
        const txHash = await writeContractAsync({
          address: StudySessionLogger_CONTRACT_ADDRESS as `0x${string}`,
          abi: StudySessionLoggerABI,
          functionName: "logSessionStart",
          args: [materialIdentifier],
        });
        return { success: true, hash: txHash };
      } catch (err: any) {
        console.error("Logging session start failed:", err);
        const errorMsg =
          err.shortMessage || err.message || "Failed to log session start";
        // Improve specific contract revert messages if possible
        if (errorMsg.includes("Material identifier required")) {
          return { success: false, error: "Material identifier required" };
        }
        return { success: false, error: errorMsg };
      }
    },
    [isConnected, address, writeContractAsync]
  );

  // Function to fetch specific session details directly from the contract
  const getSessionDetails = useCallback(
    async (sessionId: bigint): Promise<SessionLog | null> => {
      if (!publicClient) {
        console.error("Public client not available");
        return null;
      }

      setIsLoadingSessionDetails(true);
      try {
        const result = await publicClient.readContract({
          address: StudySessionLogger_CONTRACT_ADDRESS as `0x${string}`,
          abi: StudySessionLoggerABI,
          functionName: "getSessionDetails",
          args: [sessionId],
        });

        // Type assertion for the contract result (struct format from Solidity)
        const typedResult = result as [
          `0x${string}`, // user address
          string, // materialIdentifier
          bigint, // startTimestamp
        ];

        setIsLoadingSessionDetails(false);
        return {
          user: typedResult[0],
          materialIdentifier: typedResult[1],
          startTimestamp: typedResult[2],
        };
      } catch (err: any) {
        console.error(
          `Error fetching session details for ID ${sessionId}:`,
          err
        );
        setIsLoadingSessionDetails(false);
        return null;
      }
    },
    [publicClient]
  );

  // Transaction Receipt Hook
  const { isLoading: isConfirmingLog } = useWaitForTransactionReceipt({
    hash: logHash,
  });

  // Context Value
  const value = useMemo(
    () => ({
      userSessionCount: countData !== undefined ? Number(countData) : undefined,
      isLoadingUserSessionCount,
      userSessionIds: idsData as readonly bigint[] | undefined,
      isLoadingUserSessionIds,
      logSessionStart,
      isLoggingSession: isLogPending || isConfirmingLog,
      logSessionError,
      getSessionDetails,
      isLoadingSessionDetails,
    }),
    [
      countData,
      isLoadingUserSessionCount,
      idsData,
      isLoadingUserSessionIds,
      logSessionStart,
      isLogPending,
      isConfirmingLog,
      logSessionError,
      getSessionDetails,
      isLoadingSessionDetails,
    ]
  );

  return (
    <StudySessionContext.Provider value={value}>
      {children}
    </StudySessionContext.Provider>
  );
};

// Custom Hook
export const useStudySession = (): StudySessionContextType => {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error(
      "useStudySession must be used within a StudySessionProvider"
    );
  }
  return context;
};
