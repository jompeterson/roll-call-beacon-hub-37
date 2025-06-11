
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ScholarshipCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipCreated: () => void;
}

export const ScholarshipCreateModal = ({
  open,
  onOpenChange,
  onScholarshipCreated,
}: ScholarshipCreateModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    organization_name: "",
    amount: "",
    description: "",
    eligibility_criteria: "",
    application_deadline: "",
    contact_email: "",
    contact_phone: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      organization_name: "",
      amount: "",
      description: "",
      eligibility_criteria: "",
      application_deadline: "",
      contact_email: "",
      contact_phone: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a scholarship",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.organization_name || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scholarshipData = {
        title: formData.title,
        organization_name: formData.organization_name,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        eligibility_criteria: formData.eligibility_criteria || null,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        creator_user_id: user.id,
      };

      const { error } = await supabase
        .from("scholarships")
        .insert([scholarshipData]);

      if (error) {
        console.error("Error creating scholarship:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Scholarship created successfully! It will be reviewed by administrators.",
      });

      resetForm();
      onOpenChange(false);
      onScholarshipCreated();
    } catch (error) {
      console.error("Error creating scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to create scholarship. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scholarship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Scholarship Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter scholarship title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name *</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => handleInputChange("organization_name", e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="date"
                value={formData.application_deadline}
                onChange={(e) => handleInputChange("application_deadline", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the scholarship program..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
            <Textarea
              id="eligibility_criteria"
              value={formData.eligibility_criteria}
              onChange={(e) => handleInputChange("eligibility_criteria", e.target.value)}
              placeholder="List the eligibility requirements..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModalChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Scholarship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
