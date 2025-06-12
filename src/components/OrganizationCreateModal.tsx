
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizations } from "@/hooks/useOrganizations";

interface OrganizationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationCreated: () => void;
}

const organizationTypes = [
  "Non-Profit",
  "Educational Institution",
  "Community Group",
  "Religious Organization",
  "Sports Club",
  "Professional Association",
  "Other"
];

export const OrganizationCreateModal = ({ open, onOpenChange, onOrganizationCreated }: OrganizationCreateModalProps) => {
  const { toast } = useToast();
  const { organizations, refetch } = useOrganizations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const checkNameExists = (name: string) => {
    if (!name.trim()) {
      setNameExists(false);
      return;
    }
    
    const exists = organizations.some(org => 
      org.name.toLowerCase() === name.toLowerCase()
    );
    setNameExists(exists);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (nameExists) newErrors.name = "An organization with this name already exists";
    if (!formData.type.trim()) newErrors.type = "Organization type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Check name existence when name field changes
    if (field === "name") {
      checkNameExists(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          is_approved: false,
          approval_decision_made: false
        });

      if (error) {
        console.error('Error creating organization:', error);
        toast({
          title: "Error",
          description: "Failed to create organization. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Organization Created",
        description: "Your organization has been submitted for approval.",
      });

      // Reset form
      setFormData({
        name: "",
        type: "",
        description: "",
        phone: "",
        address: ""
      });
      setErrors({});
      setNameExists(false);
      
      // Refresh organizations list
      await refetch();
      
      // Close modal and notify parent
      onOpenChange(false);
      onOrganizationCreated();
      
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        type: "",
        description: "",
        phone: "",
        address: ""
      });
      setErrors({});
      setNameExists(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new organization. It will be submitted for approval.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter organization name"
              required
              disabled={isSubmitting}
              className={nameExists ? "border-destructive" : ""}
            />
            {nameExists && (
              <p className="text-sm text-destructive">An organization with this name already exists</p>
            )}
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Organization Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange("type", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                {organizationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your organization's mission and activities"
              className="min-h-[100px]"
              required
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              required
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter organization address"
              required
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || nameExists}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
