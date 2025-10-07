import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Request } from "@/hooks/useRequests";

interface RequestEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Request;
  onRequestUpdated?: () => void;
}

interface Organization {
  id: string;
  name: string;
}

export const RequestEditModal = ({ 
  open, 
  onOpenChange, 
  request,
  onRequestUpdated 
}: RequestEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    title: request.title,
    description: request.description || "",
    request_type: request.request_type,
    deadline: request.deadline ? new Date(request.deadline).toISOString().split('T')[0] : "",
    location: request.location || "",
    urgency_level: request.urgency_level || "",
    contact_email: request.contact_email || "",
    contact_phone: request.contact_phone || "",
    organization_name: request.organization_name || "",
    organization_id: request.organization_id || "",
    needs_pickup: request.needs_pickup || false
  });

  const { toast } = useToast();
  const { isAdministrator } = useAuth();

  const requestTypes = ["Tools", "Materials", "Other"];
  const urgencyLevels = ["low", "medium", "high", "urgent"];

  useEffect(() => {
    if (isAdministrator && open) {
      const fetchOrganizations = async () => {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('is_approved', true)
          .order('name');

        if (!error && data) {
          setOrganizations(data);
        }
      };

      fetchOrganizations();
    }
  }, [isAdministrator, open]);

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description || null,
        request_type: formData.request_type,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        location: formData.location || null,
        urgency_level: formData.urgency_level || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        organization_name: formData.organization_name || null,
        organization_id: formData.organization_id || null,
        needs_pickup: formData.needs_pickup,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("requests")
        .update(updateData)
        .eq("id", request.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request post updated successfully!",
      });

      onOpenChange(false);
      onRequestUpdated?.();

    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request post. Please try again.",
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
          <DialogTitle>Edit Request Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter request title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type *</Label>
              <Select value={formData.request_type} onValueChange={(value) => handleInputChange("request_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name</Label>
              {isAdministrator ? (
                <Select value={formData.organization_id} onValueChange={handleOrganizationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="organization_name"
                  value={formData.organization_name}
                  readOnly
                  className="bg-muted"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency_level">Urgency Level</Label>
              <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange("urgency_level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what you need..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="needs_pickup"
              checked={formData.needs_pickup}
              onCheckedChange={(checked) => handleInputChange("needs_pickup", checked)}
            />
            <Label htmlFor="needs_pickup" className="cursor-pointer">
              Needs Pickup
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.request_type}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Request Post"}
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