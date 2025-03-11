import { createClient } from "@/utils/supabase/server";
import { BookOpen, GraduationCap, Settings } from "lucide-react";
import { redirect } from "next/navigation";
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

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userEmail = user.email || "User";
  const userInitials = userEmail.substring(0, 2).toUpperCase();

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
              src={`https://source.unsplash.com/random/200x200/?abstract&${user.id}`}
              alt="Profile"
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="font-medium">{userEmail}</p>
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
    </div>
  );
}
