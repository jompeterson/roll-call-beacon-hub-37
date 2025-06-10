
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInformationTab } from "@/components/profile/PersonalInformationTab";
import { OrganizationTab } from "@/components/profile/OrganizationTab";
import { useProfileData } from "@/hooks/useProfileData";

export const Profile = () => {
  const {
    userProfile,
    currentOrganization,
    userRole,
    loading,
    contactInfo,
    handleContactInfoChange
  } = useProfileData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Profile data not found.</p>
        </div>
      </div>
    );
  }

  const organizationData = currentOrganization ? {
    name: currentOrganization.name,
    role: userRole?.display_name || "Member",
    joinedDate: new Date(userProfile.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    logo: "/placeholder.svg"
  } : null;

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

        <TabsContent value="personal">
          <PersonalInformationTab
            contactInfo={contactInfo}
            joinedDate={userProfile.created_at}
            onContactInfoChange={handleContactInfoChange}
          />
        </TabsContent>

        <TabsContent value="organization">
          <OrganizationTab 
            organizationData={organizationData} 
            userOrganizationId={userProfile.organization_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
