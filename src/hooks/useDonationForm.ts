
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
}

interface DonationFormData {
  title: string;
  description: string;
  estimated_value: string;
  donation_type: string;
  target_date: string;
  donation_link: string;
  contact_email: string;
  contact_phone: string;
  organization_name: string;
  organization_id: string;
}

export const useDonationForm = (open: boolean) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState<DonationFormData>({
    title: "",
    description: "",
    estimated_value: "",
    donation_type: "",
    target_date: "",
    donation_link: "",
    contact_email: "",
    contact_phone: "",
    organization_name: "",
    organization_id: ""
  });

  const { isAdministrator } = useAuth();
  const { currentOrganization, contactInfo } = useProfileData();

  // Fetch organizations for administrators
  useEffect(() => {
    if (isAdministrator && open) {
      const fetchOrganizations = async () => {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('is_approved', true)
          .order('name');

        if (error) {
          console.error('Error fetching organizations:', error);
        } else {
          setOrganizations(data || []);
        }
      };

      fetchOrganizations();
    }
  }, [isAdministrator, open]);

  // Prepopulate organization and contact information when modal opens
  useEffect(() => {
    if (open && currentOrganization && contactInfo) {
      setFormData(prev => ({
        ...prev,
        organization_name: currentOrganization.name || "",
        organization_id: currentOrganization.id || "",
        contact_email: contactInfo.email || "",
        contact_phone: contactInfo.phone || ""
      }));
    }
  }, [open, currentOrganization, contactInfo]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrganizationChange = (organizationId: string) => {
    const selectedOrg = organizations.find(org => org.id === organizationId);
    setFormData(prev => ({
      ...prev,
      organization_id: organizationId,
      organization_name: selectedOrg?.name || ""
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      estimated_value: "",
      donation_type: "",
      target_date: "",
      donation_link: "",
      contact_email: contactInfo?.email || "",
      contact_phone: contactInfo?.phone || "",
      organization_name: currentOrganization?.name || "",
      organization_id: currentOrganization?.id || ""
    });
  };

  return {
    formData,
    organizations,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleOrganizationChange,
    resetForm
  };
};
