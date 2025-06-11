
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequestCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCreated: () => void;
}

export const RequestCreateModal = ({ open, onOpenChange, onRequestCreated }: RequestCreateModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    urgency_level: "medium",
    request_type: "",
    contact_email: "",
    contact_phone: "",
    location: "",
    deadline: "",
    organization_name: ""
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a request",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("requests")
        .insert({
          title: formData.title,
          description: formData.description,
          urgency_level: formData.urgency_level,
          request_type: formData.request_type,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          location: formData.location || null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          organization_name: formData.organization_name || null,
          creator_user_id: user.id
        });

      if (error) {
        console.error("Error creating request:", error);
        toast({
          title: "Error",
          description: "Failed to create request. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Request created successfully! It will be reviewed before being published."
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        urgency_level: "medium",
        request_type: "",
        contact_email: "",
        contact_phone: "",
        location: "",
        deadline: "",
        organization_name: ""
      });

      onRequestCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
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
          <DialogTitle>Create New Request</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter request title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what you need help with"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="request_type">Request Type *</Label>
            <Input
              id="request_type"
              value={formData.request_type}
              onChange={(e) => handleInputChange("request_type", e.target.value)}
              placeholder="e.g., Volunteer Help, Material Donation, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="urgency_level">Urgency Level</Label>
            <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange("urgency_level", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Where is help needed?"
            />
          </div>

          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
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
              {isLoading ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
