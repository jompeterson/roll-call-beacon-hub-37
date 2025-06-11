
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string;
  address: string;
  contact_user_id: string | null;
  contact_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export const useOrganizations = () => {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id, 
          name, 
          type, 
          description, 
          phone, 
          address,
          contact_user_id,
          contact_user:user_profiles!contact_user_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching organizations:', error);
        toast({
          title: "Error",
          description: "Failed to load organizations.",
          variant: "destructive",
        });
        return;
      }

      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationContact = async (organizationId: string, contactUserId: string | null) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ contact_user_id: contactUserId })
        .eq('id', organizationId);

      if (error) {
        console.error('Error updating organization contact:', error);
        toast({
          title: "Error",
          description: "Failed to update organization contact.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Organization contact updated successfully.",
      });
      
      // Refresh the organizations list
      await fetchOrganizations();
      return true;
    } catch (error) {
      console.error('Error updating organization contact:', error);
      toast({
        title: "Error",
        description: "Failed to update organization contact.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    refetch: fetchOrganizations,
    updateOrganizationContact
  };
};
