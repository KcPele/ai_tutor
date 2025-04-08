"use client";

import React, { ReactNode } from "react";
import { SubscriptionProvider } from "./subscription-provider";
// import { StudySessionProvider } from "./study-session-provider";
// import { ContentFeedbackProvider } from "./content-feedback-provider";
// import { AchievementProvider } from "./achievement-nft-provider";

interface Web3ProvidersProps {
  children: ReactNode;
}

export const Web3Providers = ({ children }: Web3ProvidersProps) => {
  return (
    <SubscriptionProvider>
      {/* <StudySessionProvider>
        <ContentFeedbackProvider>
          <AchievementProvider> */}
      {children}
      {/* </AchievementProvider>
            </ContentFeedbackProvider>
        </StudySessionProvider> */}
    </SubscriptionProvider>
  );
};
