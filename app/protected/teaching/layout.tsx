"use client";

import { useSubscription } from "@/providers/subscription-provider";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LockIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProtectedTeachingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const { isSubscriptionActive, subscriptionStatus, isLoadingStatus } =
    useSubscription();

  // Check if user is on free plan (plan ID 0) or has no active subscription
  useEffect(() => {
    // Only show modal after we've checked the subscription status
    if (!isLoadingStatus) {
      const isFreeUser =
        !isSubscriptionActive ||
        (subscriptionStatus && subscriptionStatus.planId === 0);

      if (isFreeUser) {
        setShowUpgradeModal(true);
      }
    }
  }, [isSubscriptionActive, subscriptionStatus, isLoadingStatus]);

  // Handle redirect to plans/dashboard
  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    router.push("/protected");
  };

  return (
    <>
      {children}

      <Dialog
        open={showUpgradeModal}
        onOpenChange={(open) => {
          // Prevent closing the modal - it can only be closed by the upgrade button
          if (open === false) {
            return;
          }
          setShowUpgradeModal(open);
        }}
      >
        <DialogContent
          className={cn(
            "sm:max-w-md",
            // Hide the close button
            "[&>button[data-state]]:hidden"
          )}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <LockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Premium Feature Access
            </DialogTitle>
            <DialogDescription className="text-center">
              AI teaching features are only available on Basic and Pro plans
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium mb-1">
                  Your current plan doesn't include:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>Access to AI tutor sessions</li>
                  <li>PDF document uploads</li>
                  <li>Premium learning features</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-center">
            <Button
              onClick={handleUpgrade}
              className="w-full sm:w-auto px-8"
              variant="default"
              size="lg"
            >
              Upgrade Your Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
