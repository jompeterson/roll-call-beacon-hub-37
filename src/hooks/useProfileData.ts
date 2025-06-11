
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { customAuth, type User as CustomUser } from "@/lib/customAuth";

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

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const useProfileData = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<CustomUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const fetchUserData = async () => {
    try {
      // Get current user from custom auth
      const currentUser = customAuth.getUser();
      
      if (!currentUser) {
        // Don't show toast if user is not logged in - this is expected behavior
        setLoading(false);
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

  const handleContactInfoChange = async (updatedInfo: ContactInfo) => {
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

  useEffect(() => {
    fetchUserData();

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      if (user) {
        fetchUserData();
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentOrganization(null);
        setUserRole(null);
        setContactInfo({
          firstName: "",
          lastName: "",
          email: "",
          phone: ""
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    currentOrganization,
    userRole,
    loading,
    contactInfo,
    handleContactInfoChange
  };
};
