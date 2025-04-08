"use client";
import {
  BookOpen,
  GraduationCap,
  Settings,
  Crown,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccount } from "wagmi";
import { useSubscription } from "@/providers/subscription-provider";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function ProtectedPage() {
  const { address } = useAccount();
  const {
    isSubscriptionActive,
    subscriptionStatus,
    allPlans,
    isLoadingAllPlans,
    fetchAllPlans,
    subscribeToPlan,
    isSubscribing,
  } = useSubscription();
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(
    null
  );

  // Fetch all plans on component mount
  useEffect(() => {
    fetchAllPlans();
  }, [fetchAllPlans]);

  // Handle subscription to a plan
  const handleSubscribe = async (planId: number, price: string) => {
    setSubscribingPlanId(planId);
    try {
      const { success, error } = await subscribeToPlan(planId, price);

      if (success) {
        toast({
          title: "Subscription successful!",
          description: "You have successfully subscribed to the plan.",
          variant: "default",
        });
        // Refresh plans data
        await fetchAllPlans();
      } else {
        toast({
          title: "Subscription failed",
          description:
            error || "Failed to subscribe to the plan. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Subscription error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubscribingPlanId(null);
    }
  };

  // Format expiry date
  const formatExpiryDate = (timestamp: bigint) => {
    if (!timestamp) return null;

    const expiryDate = new Date(Number(timestamp) * 1000);
    return expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-4 py-8 md:px-8 md:py-12 max-w-7xl mx-auto">
      {/* Header with welcome message and user info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-accent/30 p-6 rounded-lg">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Welcome to the AI Teaching App
          </h1>
          <p className="text-muted-foreground mt-1">
            Your personalized learning assistant powered by AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage
              src={`https://source.unsplash.com/random/200x200/?abstract&${address}`}
              alt="Profile"
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {address?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="font-medium">{address}</p>
            <p className="text-sm text-muted-foreground">Student</p>
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Start Learning Card */}
        <Card className="group hover:shadow-md transition-all border-2 hover:border-primary">
          <CardHeader className="pb-2">
            <div className="p-2 w-fit rounded-full bg-primary/10 text-primary mb-2">
              <BookOpen className="h-6 w-6" />
            </div>
            <CardTitle>Start Learning</CardTitle>
            <CardDescription>
              Upload and learn from PDF materials
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Upload your study materials and get AI-powered assistance to
            understand complex topics.
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full group-hover:bg-primary/90">
              <Link href="/protected/teaching">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Study Progress Card */}
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="p-2 w-fit rounded-full bg-orange-500/10 text-orange-500 mb-2">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle>Study Progress</CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Monitor your progress, review completed lessons, and set goals for
            your learning path.
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/protected/progress">View Progress</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Settings Card */}
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="p-2 w-fit rounded-full bg-blue-500/10 text-blue-500 mb-2">
              <Settings className="h-6 w-6" />
            </div>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Modify your account settings, notification preferences, and learning
            parameters.
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/protected/settings">Manage Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick stats section */}
      <div className="mt-2 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background p-4 rounded-md">
            <p className="text-muted-foreground text-sm">Lessons Completed</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md">
            <p className="text-muted-foreground text-sm">Study Hours</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md">
            <p className="text-muted-foreground text-sm">Materials</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md">
            <p className="text-muted-foreground text-sm">Achievement Points</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div className="mt-2 p-6 bg-muted/50 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            {isSubscriptionActive ? (
              <>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500"
                >
                  Active Subscription
                </Badge>
                {subscriptionStatus?.expiresAt && (
                  <span className="text-sm text-muted-foreground">
                    Expires on {formatExpiryDate(subscriptionStatus.expiresAt)}
                  </span>
                )}
              </>
            ) : (
              <Badge
                variant="outline"
                className="bg-yellow-500/10 text-yellow-500 border-yellow-500"
              >
                No Active Subscription
              </Badge>
            )}
          </div>
        </div>

        {isLoadingAllPlans ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading subscription plans...
            </span>
          </div>
        ) : !allPlans || allPlans.length === 0 ? (
          <div className="text-center py-8 bg-background rounded-md">
            <p className="text-muted-foreground">
              No subscription plans available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allPlans.map((plan) => {
              const isUserPlan = subscriptionStatus?.planId === plan.id;
              const durationInDays = Number(plan.duration) / 86400; // Convert seconds to days
              const isCurrentlySubscribing = subscribingPlanId === plan.id;

              // Plan features based on plan ID
              let planFeatures;
              if (plan.id === 0) {
                // Free plan
                planFeatures = [
                  "Access to your profile",
                  "No PDF uploads",
                  "1 demo test only",
                ];
              } else if (plan.id === 1) {
                // Basic plan
                planFeatures = [
                  "Access to AI tutor (4 sessions)",
                  "PDF uploads (15 documents)",
                  "Premium learning features",
                ];
              } else {
                // Pro plan (id === 2)
                planFeatures = [
                  "All Basic features",
                  "Extended AI tutor (20 sessions)",
                  "PDF uploads (34 documents)",
                ];
              }

              return (
                <Card
                  key={plan.id}
                  className={`transition-all ${
                    isUserPlan
                      ? "border-2 border-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <CardHeader className="pb-2 relative">
                    {isUserPlan && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-primary text-primary-foreground">
                          Your Plan
                        </Badge>
                      </div>
                    )}
                    <div className="p-2 w-fit rounded-full bg-purple-500/10 text-purple-500 mb-2">
                      <Crown className="h-6 w-6" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {durationInDays} day{durationInDays !== 1 ? "s" : ""}{" "}
                      subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-4">
                      {plan.formattedPrice} ETH
                    </p>
                    <ul className="space-y-2">
                      {planFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={isUserPlan ? "outline" : "default"}
                      className="w-full"
                      disabled={!plan.isActive || isUserPlan || isSubscribing}
                      onClick={() =>
                        !isUserPlan &&
                        handleSubscribe(plan.id, plan.formattedPrice)
                      }
                    >
                      {isUserPlan ? (
                        "Current Plan"
                      ) : isCurrentlySubscribing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Subscribing...
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
