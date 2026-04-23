
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

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
  weight: string;
  material_type: string;
  images: File[];
  can_deliver: boolean;
  delivery_miles: string;
  service_type: string;
  hours_available: string;
  equipment_type: string;
  mileage: string;
  facility_type: string;
  capacity: string;
  location: string;
  dimensions: string;
  dimension_unit: string;
  quantity: string;
}

interface DonationFormSubmissionProps {
  formData: DonationFormData;
  setIsSubmitting: (value: boolean) => void;
  onSuccess: () => void;
  resetForm: () => void;
}

export const useDonationFormSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitDonation = async ({ 
    formData, 
    setIsSubmitting, 
    onSuccess, 
    resetForm 
  }: DonationFormSubmissionProps) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a donation post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls: string[] = [];
      
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          const { error: uploadError } = await supabase.storage
            .from('donation-images')
            .upload(filePath, image, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            let errorMsg = `Failed to upload image: ${image.name}`;
            if (uploadError.message.includes('row-level security')) {
              errorMsg = 'Unable to upload images. Please check your permissions.';
            }
            toast({
              title: "Upload Error",
              description: errorMsg,
              variant: "destructive",
            });
            throw new Error(errorMsg);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('donation-images')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      const donationData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        amount_needed: parseFloat(formData.estimated_value),
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
        donation_link: formData.donation_link || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        organization_name: formData.organization_name || null,
        creator_user_id: user.id,
        organization_id: formData.organization_id || null,
        amount_raised: 0,
        is_approved: false,
        approval_decision_made: false,
        donation_type: formData.donation_type || null,
        images: imageUrls,
        can_deliver: formData.can_deliver,
        delivery_miles: formData.delivery_miles ? parseFloat(formData.delivery_miles) : null,
        location: formData.location || null
      };

      // Type-specific fields
      const isPhysical = ["Tools", "Materials", "Other"].includes(formData.donation_type);
      if (isPhysical) {
        donationData.weight = formData.weight ? parseFloat(formData.weight) : 0;
        donationData.material_type = formData.material_type || null;
        donationData.dimensions = formData.dimensions ? parseFloat(formData.dimensions) : null;
        donationData.dimension_unit = formData.dimension_unit || null;
        donationData.quantity = formData.quantity ? parseInt(formData.quantity) : null;
      }
      if (formData.donation_type === "Professional Services / Labor") {
        donationData.service_type = formData.service_type || null;
        donationData.hours_available = formData.hours_available ? parseFloat(formData.hours_available) : null;
      }
      if (formData.donation_type === "Transportation / Equipment Use") {
        donationData.equipment_type = formData.equipment_type || null;
        donationData.mileage = formData.mileage ? parseFloat(formData.mileage) : null;
      }
      if (formData.donation_type === "Facility Use") {
        donationData.facility_type = formData.facility_type || null;
        donationData.capacity = formData.capacity ? parseInt(formData.capacity) : null;
      }

      const { error } = await supabase
        .from("donations")
        .insert([donationData as any]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['pending-donations'] });

      toast({
        title: "Success",
        description: "Donation post created successfully!",
      });

      resetForm();
      onSuccess();

    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        title: "Error",
        description: "Failed to create donation post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitDonation };
};
