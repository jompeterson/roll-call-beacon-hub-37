
import { Play, BookOpen, Users, Calendar, HandHeart, GraduationCap, Hammer, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const videos: { title: string; description: string; icon: typeof BookOpen; category: string; videoUrl?: string }[] = [
  {
    title: "Roll Call Enrollment Tutorial",
    description: "Learn how to enroll and create your account on the Roll Call platform.",
    icon: BookOpen,
    category: "Getting Started",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Enrollment-Tutorial.mp4",
  },
  {
    title: "Roll Call Profile Overview",
    description: "A walkthrough of your profile page and how to manage your personal information.",
    icon: Users,
    category: "Profile",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Profile-Overview-Tutorial.mp4",
  },
  {
    title: "Posting Donations",
    description: "How to create and post donation listings for your organization.",
    icon: HandHeart,
    category: "Donations",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Posting-Donations-Tutorial.mp4",
  },
  {
    title: "Fulfill Donation",
    description: "Learn how to fulfill and complete donation requests from other organizations.",
    icon: Hammer,
    category: "Donations",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Fulfill-Donation-Tutorial.mp4",
  },
  {
    title: "Posting Events",
    description: "How to create and publish events for your community.",
    icon: Calendar,
    category: "Events",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Posting-Events-Tutorial.mp4",
  },
  {
    title: "Posting Scholarships",
    description: "Learn how to post scholarship opportunities for students and applicants.",
    icon: GraduationCap,
    category: "Scholarships",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Posting-Scholarships-Tutorial.mp4",
  },
  {
    title: "Posting Volunteer Opportunities",
    description: "How to create and share volunteer opportunities for your organization.",
    icon: Settings,
    category: "Volunteers",
    videoUrl: "https://rollcall.pacificcrest.us/lovable-uploads/Roll-Call-Posting-Volunteer-Opportunities-Tutorial.mp4",
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
                {video.videoUrl ? (
                  <video
                    className="w-full h-full object-cover rounded-t-lg"
                    controls
                    preload="metadata"
                    src={video.videoUrl}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-3 cursor-pointer group">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Play className="h-7 w-7 text-primary ml-1" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Video Coming Soon
                    </span>
                  </div>
                )}
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
