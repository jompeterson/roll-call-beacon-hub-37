import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
import { AccountInformation } from "@/components/profile/AccountInformation";
import { ContactInformation } from "@/components/profile/ContactInformation";
import { CurrentOrganization } from "@/components/profile/CurrentOrganization";
import { OrganizationSearch } from "@/components/profile/OrganizationSearch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  created_at: string;
  organization_id: string | null;
  role_id: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
}

export const Profile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

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

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to view your profile.",
          variant: "destructive",
        });
        return;
      }

      setUser(currentUser);

      // Fetch user profile with role information
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            display_name,
            description
          )
        `)
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
        return;
      }

      setUserProfile(profile);
      setUserRole(profile.user_roles);
      setContactInfo({
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone
      });

      // Fetch organization if user has one
      if (profile.organization_id) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
        } else {
          setCurrentOrganization(org);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactInfoChange = async (updatedInfo: typeof contactInfo) => {
    setContactInfo(updatedInfo);
    
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updatedInfo.firstName,
          last_name: updatedInfo.lastName,
          email: updatedInfo.email,
          phone: updatedInfo.phone
        })
        .eq('id', userProfile.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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

        <TabsContent value="personal" className="space-y-6">
          <ProfileImageSection contactInfo={contactInfo} />
          <AccountInformation joinedDate={userProfile.created_at} />
          <ContactInformation 
            contactInfo={contactInfo} 
            onContactInfoChange={handleContactInfoChange} 
          />
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          {organizationData ? (
            <CurrentOrganization organization={organizationData} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No organization assigned</p>
            </div>
          )}
          <OrganizationSearch organizations={availableOrganizations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
