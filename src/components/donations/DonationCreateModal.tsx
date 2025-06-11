
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DonationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonationCreated?: () => void;
}

export const DonationCreateModal = ({ 
  open, 
  onOpenChange, 
  onDonationCreated 
}: DonationCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_needed: "",
    target_date: "",
    donation_link: "",
    contact_email: "",
    contact_phone: "",
    organization_name: ""
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const donationData = {
        title: formData.title,
        description: formData.description || null,
        amount_needed: parseFloat(formData.amount_needed),
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
        donation_link: formData.donation_link || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        organization_name: formData.organization_name || null,
        creator_user_id: user.id,
        amount_raised: 0,
        is_approved: false,
        approval_decision_made: false
      };

      const { error } = await supabase
        .from("donations")
        .insert([donationData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Donation post created successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        amount_needed: "",
        target_date: "",
        donation_link: "",
        contact_email: "",
        contact_phone: "",
        organization_name: ""
      });

      onOpenChange(false);
      onDonationCreated?.();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Donation Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter donation title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_needed">Amount Needed *</Label>
              <Input
                id="amount_needed"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount_needed}
                onChange={(e) => handleInputChange("amount_needed", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => handleInputChange("organization_name", e.target.value)}
                placeholder="Enter organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange("target_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donation_link">Donation Link</Label>
            <Input
              id="donation_link"
              type="url"
              value={formData.donation_link}
              onChange={(e) => handleInputChange("donation_link", e.target.value)}
              placeholder="https://example.com/donate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your donation needs..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.amount_needed}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Donation Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
