
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DonationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonationCreated: () => void;
}

export const DonationCreateModal = ({ open, onOpenChange, onDonationCreated }: DonationCreateModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_needed: "",
    target_date: "",
    contact_email: "",
    contact_phone: "",
    organization_name: "",
    donation_link: ""
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a donation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("donations")
        .insert({
          title: formData.title,
          description: formData.description,
          amount_needed: parseFloat(formData.amount_needed),
          target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          organization_name: formData.organization_name || null,
          donation_link: formData.donation_link || null,
          creator_user_id: user.id
        });

      if (error) {
        console.error("Error creating donation:", error);
        toast({
          title: "Error",
          description: "Failed to create donation. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Donation created successfully! It will be reviewed before being published."
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        amount_needed: "",
        target_date: "",
        contact_email: "",
        contact_phone: "",
        organization_name: "",
        donation_link: ""
      });

      onDonationCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        title: "Error",
        description: "Failed to create donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Donation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter donation title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what the donation is for"
              rows={4}
            />
          </div>

          <div>
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

          <div>
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => handleInputChange("target_date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleInputChange("contact_email", e.target.value)}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleInputChange("contact_phone", e.target.value)}
              placeholder="(123) 456-7890"
            />
          </div>

          <div>
            <Label htmlFor="organization_name">Organization Name</Label>
            <Input
              id="organization_name"
              value={formData.organization_name}
              onChange={(e) => handleInputChange("organization_name", e.target.value)}
              placeholder="Organization or individual name"
            />
          </div>

          <div>
            <Label htmlFor="donation_link">Donation Link</Label>
            <Input
              id="donation_link"
              type="url"
              value={formData.donation_link}
              onChange={(e) => handleInputChange("donation_link", e.target.value)}
              placeholder="https://example.com/donate"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Donation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
