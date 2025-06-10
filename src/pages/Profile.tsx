
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
import { AccountInformation } from "@/components/profile/AccountInformation";
import { ContactInformation } from "@/components/profile/ContactInformation";
import { CurrentOrganization } from "@/components/profile/CurrentOrganization";
import { OrganizationSearch } from "@/components/profile/OrganizationSearch";

export const Profile = () => {
  const [contactInfo, setContactInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  });

  // Current organization data
  const currentOrganization = {
    name: "Tech Solutions Inc",
    role: "Software Developer",
    joinedDate: "January 15, 2024",
    logo: "/placeholder.svg"
  };

  // Mock organizations for search with detailed information
  const availableOrganizations = [
    { 
      id: "1", 
      name: "Green Earth Foundation", 
      type: "Environmental",
      userCount: 245,
      owner: "Sarah Johnson",
      email: "contact@greenearth.org",
      phone: "+1 (555) 987-6543",
      description: "Dedicated to environmental conservation and sustainable practices."
    },
    { 
      id: "2", 
      name: "Community Health Center", 
      type: "Healthcare",
      userCount: 128,
      owner: "Dr. Michael Chen",
      email: "info@communityhealthcenter.org",
      phone: "+1 (555) 234-5678",
      description: "Providing quality healthcare services to the community."
    },
    { 
      id: "3", 
      name: "Education First", 
      type: "Education",
      userCount: 89,
      owner: "Lisa Rodriguez",
      email: "hello@educationfirst.org",
      phone: "+1 (555) 345-6789",
      description: "Improving educational opportunities for underserved communities."
    },
    { 
      id: "4", 
      name: "Local Food Bank", 
      type: "Community Service",
      userCount: 67,
      owner: "Robert Wilson",
      email: "support@localfoodbank.org",
      phone: "+1 (555) 456-7890",
      description: "Fighting hunger in our local community through food distribution."
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <ProfileImageSection contactInfo={contactInfo} />
          <AccountInformation />
          <ContactInformation 
            contactInfo={contactInfo} 
            onContactInfoChange={setContactInfo} 
          />
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <CurrentOrganization organization={currentOrganization} />
          <OrganizationSearch organizations={availableOrganizations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
