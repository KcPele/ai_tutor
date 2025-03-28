import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Book,
  CreditCard,
  Calendar,
  Clock,
  Medal,
  User,
  MessageSquare,
  FileText,
  Edit,
  Share,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userEmail = user.email || "User";
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  // Mock data for user profile
  const userProfile = {
    name: userEmail.split("@")[0] || "Student",
    role: "Student",
    joinDate: "January 15, 2023",
    bio: "Passionate learner interested in artificial intelligence and data science.",
    subscription: {
      plan: "Premium",
      status: "active",
      validUntil: "December 31, 2023",
    },
    stats: {
      studyHours: 42,
      lessonsCompleted: 12,
      documentsUploaded: 8,
      questionsAsked: 65,
    },
    achievements: [
      {
        id: 1,
        name: "Fast Learner",
        date: "2 weeks ago",
        description: "Complete 10 lessons in a week",
      },
      {
        id: 2,
        name: "Document Master",
        date: "1 month ago",
        description: "Upload 5 study materials",
      },
    ],
    recentActivity: [
      {
        id: 1,
        type: "lesson",
        name: "Machine Learning Basics",
        date: "Yesterday",
        progress: 100,
      },
      {
        id: 2,
        type: "question",
        name: "Neural Network Architecture",
        date: "3 days ago",
        progress: null,
      },
      {
        id: 3,
        type: "document",
        name: "Data Science Handbook.pdf",
        date: "1 week ago",
        progress: null,
      },
    ],
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-4 py-8 md:px-8 md:py-12 max-w-7xl mx-auto">
      {/* Header with profile summary */}
      <div className="bg-accent/30 rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40"></div>
        <div className="p-6 -mt-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage
                src={`https://source.unsplash.com/random/200x200/?abstract&${user.id}`}
                alt="Profile"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                <div>
                  <h1 className="font-bold text-3xl tracking-tight">
                    {userProfile.name}
                  </h1>
                  <p className="text-muted-foreground">{userProfile.role}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm">{userProfile.bio}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Calendar className="h-3 w-3 mr-1" />
                Joined {userProfile.joinDate}
              </Badge>
              <Badge className="bg-primary text-primary-foreground">
                <CreditCard className="h-3 w-3 mr-1" />
                {userProfile.subscription.plan}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">
                {userProfile.stats.studyHours}
              </h3>
              <p className="text-sm text-muted-foreground">Study Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Book className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">
                {userProfile.stats.lessonsCompleted}
              </h3>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">
                {userProfile.stats.documentsUploaded}
              </h3>
              <p className="text-sm text-muted-foreground">Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">
                {userProfile.stats.questionsAsked}
              </h3>
              <p className="text-sm text-muted-foreground">Questions Asked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Subscription Plan
          </CardTitle>
          <CardDescription>
            Your current subscription details and benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-accent/30 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.subscription.plan}
                  </p>
                </div>
                <Badge
                  variant={
                    userProfile.subscription.status === "active"
                      ? "default"
                      : "outline"
                  }
                >
                  {userProfile.subscription.status}
                </Badge>
              </div>
              <p className="text-sm">
                Valid until:{" "}
                <span className="font-medium">
                  {userProfile.subscription.validUntil}
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Plan Benefits</h3>
              <ul className="space-y-2">
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Unlimited PDF uploads
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Advanced AI teaching assistant
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Priority support
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Custom learning paths
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>

      {/* Recent Activity and Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProfile.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/30 transition-colors"
                >
                  <div className="bg-primary/10 p-2 rounded-full">
                    {activity.type === "lesson" && (
                      <Book className="h-4 w-4 text-primary" />
                    )}
                    {activity.type === "question" && (
                      <MessageSquare className="h-4 w-4 text-primary" />
                    )}
                    {activity.type === "document" && (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                      {activity.progress !== null && (
                        <Badge
                          variant={
                            activity.progress === 100 ? "default" : "outline"
                          }
                          className="ml-auto"
                        >
                          {activity.progress}%
                        </Badge>
                      )}
                    </div>
                    {activity.progress !== null && (
                      <Progress
                        value={activity.progress}
                        className="h-1 mt-2"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>Badges and awards you've earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProfile.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 p-3 rounded-md bg-accent/30"
                >
                  <div className="bg-primary/20 text-primary p-2 rounded-full">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs mt-1">Earned {achievement.date}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center p-4 border border-dashed rounded-md">
                <div className="text-center">
                  <p className="font-medium text-sm">
                    More achievements to unlock
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep learning to earn more badges and rewards
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Achievements
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
