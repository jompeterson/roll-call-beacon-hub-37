
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useScholarshipForm } from "@/hooks/useScholarshipForm";
import { ScholarshipFormFields } from "@/components/scholarship/ScholarshipFormFields";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
}

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
  const { userRole, currentOrganization } = useProfileData();
  const isAdmin = userRole?.name === "administrator";
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  // Fetch all organizations for admin users
  useEffect(() => {
    if (isAdmin && open) {
      const fetchOrgs = async () => {
        const { data } = await supabase
          .from("organizations")
          .select("id, name")
          .eq("is_approved", true)
          .order("name");
        if (data) setAllOrganizations(data);
      };
      fetchOrgs();
    }
  }, [isAdmin, open]);

  // Set default selected org
  useEffect(() => {
    if (currentOrganization) {
      setSelectedOrgId(currentOrganization.id);
    }
  }, [currentOrganization]);

  const overrideOrg = isAdmin && selectedOrgId
    ? allOrganizations.find(o => o.id === selectedOrgId) || null
    : null;

  const {
    formData,
    images,
    isSubmitting,
    handleInputChange,
    handleImagesChange,
    handleSubmit,
    resetForm,
  } = useScholarshipForm({
    onScholarshipCreated,
    onClose: () => onOpenChange(false),
    overrideOrganization: overrideOrg,
  });

  const handleModalChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const effectiveOrg = overrideOrg || currentOrganization;

  if (!effectiveOrg && !isAdmin) {
    return (
      <Dialog open={open} onOpenChange={handleModalChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cannot Create Scholarship</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You must be associated with an organization to create scholarships. 
              Please contact an administrator to be added to an organization.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => handleModalChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scholarship</DialogTitle>
          {isAdmin ? (
            <div className="space-y-2 pt-2">
              <Label>Creating scholarship for:</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {allOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Creating scholarship for: <span className="font-medium">{currentOrganization?.name}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScholarshipFormFields
            formData={formData}
            images={images}
            onInputChange={handleInputChange}
            onImagesChange={handleImagesChange}
          />

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModalChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || (isAdmin && !selectedOrgId)}>
              {isSubmitting ? "Creating..." : "Create Scholarship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
