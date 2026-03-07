
import { Play, BookOpen, Users, Calendar, HandHeart, GraduationCap, Hammer, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const videos = [
  {
    title: "Getting Started with Roll Call",
    description: "Learn the basics of navigating the platform and setting up your account.",
    icon: BookOpen,
    category: "Getting Started",
  },
  {
    title: "Managing Donations",
    description: "How to create, track, and manage donations and material requests.",
    icon: Hammer,
    category: "Donations",
  },
  {
    title: "Creating & Managing Events",
    description: "Learn how to create events, manage RSVPs, and track attendance.",
    icon: Calendar,
    category: "Events",
  },
  {
    title: "Scholarship Management",
    description: "How to post scholarships and review applications.",
    icon: GraduationCap,
    category: "Scholarships",
  },
  {
    title: "Volunteer Opportunities",
    description: "Create volunteer opportunities and manage sign-ups.",
    icon: HandHeart,
    category: "Volunteers",
  },
  {
    title: "Managing Your Organization",
    description: "How to set up and manage your organization's profile and members.",
    icon: Users,
    category: "Organizations",
  },
  {
    title: "User Management for Admins",
    description: "Learn how to manage users, roles, and permissions as an administrator.",
    icon: Settings,
    category: "Administration",
  },
  {
    title: "Using Widgets & Custom Reports",
    description: "How to create custom widgets and generate reports from your data.",
    icon: BookOpen,
    category: "Advanced",
  },
];

export const Resources = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Video tutorials to help you get the most out of the platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {videos.map((video, index) => {
          const Icon = video.icon;
          return (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Video Placeholder */}
              <AspectRatio ratio={16 / 9}>
                <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-3 cursor-pointer group">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Play className="h-7 w-7 text-primary ml-1" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Video Coming Soon
                  </span>
                </div>
              </AspectRatio>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {video.category}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {video.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{video.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
