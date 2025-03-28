import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Check, Clock, LineChart, CalendarDays, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userEmail = user.email || "User";
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  // Mock data for progress visualization
  const recentTopics = [
    {
      id: 1,
      name: "Machine Learning Basics",
      progress: 75,
      date: "2 days ago",
    },
    { id: 2, name: "Neural Networks", progress: 45, date: "1 week ago" },
    { id: 3, name: "Data Structures", progress: 90, date: "3 days ago" },
  ];

  const weeklyStudyHours = [4, 5, 3, 6, 2, 4, 1];
  const weeklyProgress = Math.round(
    (weeklyStudyHours.reduce((a, b) => a + b, 0) / 25) * 100
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-4 py-8 md:px-8 md:py-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-accent/30 p-6 rounded-lg">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Study Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and achievements
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

      {/* Weekly stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Weekly Overview
          </CardTitle>
          <CardDescription>
            Your study activity from the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Weekly Study Goal</p>
                  <p className="text-xs text-muted-foreground">
                    {weeklyStudyHours.reduce((a, b) => a + b, 0)} of 25 hours
                    completed
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {weeklyProgress}% Complete
                </Badge>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={day} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {day}
                  </div>
                  <div
                    className="mx-auto h-16 w-full rounded-md bg-primary/10 flex items-end justify-center relative group"
                    style={
                      {
                        "--value": `${(weeklyStudyHours[i] / 8) * 100}%`,
                      } as any
                    }
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-md transition-all"
                      style={{
                        height: `${(weeklyStudyHours[i] / 8) * 100}%`,
                      }}
                    ></div>
                    <span className="text-xs font-medium relative z-10 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {weeklyStudyHours[i]}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Recent Progress
          </CardTitle>
          <CardDescription>Recent topics you've been studying</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentTopics.map((topic) => (
              <div key={topic.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{topic.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      Last studied {topic.date}
                    </div>
                  </div>
                  <Badge
                    variant={topic.progress >= 75 ? "default" : "outline"}
                    className="ml-auto"
                  >
                    {topic.progress}%
                  </Badge>
                </div>
                <Progress value={topic.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Badges */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
        </TabsList>
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Learning Achievements</CardTitle>
              <CardDescription>
                Accomplishments in your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-accent/30 p-4 rounded-lg text-center">
                  <div className="mx-auto bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-full mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">First Lesson</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete your first lesson
                  </p>
                  <Badge variant="outline" className="mt-3">
                    Not Earned
                  </Badge>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg text-center">
                  <div className="mx-auto bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-full mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">5 Hour Club</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Study for 5 hours total
                  </p>
                  <Badge variant="outline" className="mt-3">
                    Not Earned
                  </Badge>
                </div>
                <div className="bg-accent/30 p-4 rounded-lg text-center">
                  <div className="mx-auto bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-full mb-3">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Material Master</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload 5 study materials
                  </p>
                  <Badge variant="outline" className="mt-3">
                    Not Earned
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Your Study Materials</CardTitle>
              <CardDescription>
                Materials you've uploaded for learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No materials yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  You haven't uploaded any study materials yet. Head to the
                  teaching page to upload your first document.
                </p>
                <Button className="mt-4">Upload Materials</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
