
import { Play, BookOpen, Users, Calendar, HandHeart, GraduationCap, Hammer, Settings, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I update my profile information?",
    answer: "Navigate to your Profile page, located in the top navigation bar. There, you can update your personal information such as name, phone number, and address. You can also upload or change your profile picture, see your post activity, and request access to an organization.",
  },
  {
    question: "How do I post a donation?",
    answer: "Go to the Donations page and click the '+ Add Donation' button, or use the circle '+' button in the bottom right corner while on any page. Fill in the donation details, including title, description, amount needed, material type, and contact information. You can also upload images. Once submitted, the donation will be reviewed before it becomes visible to others.",
  },
  {
    question: "How do I create an event?",
    answer: "Navigate to the Events page and click the '+ Add Event' button, or use the circle '+' button in the bottom right corner while on any page. Enter the event title, description, date, time, location, and optionally set a maximum number of participants. After submission, the event will go through an approval process before being published.",
  },
  {
    question: "How do I post a scholarship?",
    answer: "Go to the Scholarships page and click the '+ Add Scholarship' button, or use the circle '+' button in the bottom right corner while on any page. Provide the scholarship title, description, amount, eligibility criteria, application deadline, and a link to the application. The scholarship will need to be approved before it's visible to applicants.",
  },
  {
    question: "How do I post a volunteer opportunity?",
    answer: "Navigate to the Volunteers page and click the '+ Add Opportunity' button, or use the circle '+' button in the bottom right corner while on any page. Fill in the opportunity details, including title, description, dates, location, and maximum number of volunteers. Once approved, community members can sign up directly through the platform.",
  },
  {
    question: "How do I submit a Request for donations?",
    answer: "Go to the Donations page and select the '+ Add Request' button, or use the circle '+' button in the bottom right corner while on any page. Specify what you need, the urgency level, deadline, and your contact information. Approved requests will be visible to other organizations that may be able to help.",
  },
];

export const Resources = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          FAQs and video tutorials to help you get the most out of the platform
        </p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="gap-2">
            <Play className="h-4 w-4" />
            Tutorials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about using the Roll Call platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video, index) => {
              const Icon = video.icon;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
