import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ContentType = "donation" | "request" | "scholarship" | "event" | "volunteer";

interface FieldOption {
  key: string;
  label: string;
}

const FIELDS_BY_TYPE: Record<ContentType, FieldOption[]> = {
  donation: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "donation_type", label: "Donation Type" },
    { key: "amount_needed", label: "Amount Needed" },
    { key: "location", label: "Location" },
    { key: "target_date", label: "Target Date" },
    { key: "contact_email", label: "Contact Email" },
    { key: "contact_phone", label: "Contact Phone" },
    { key: "images", label: "Images" },
    { key: "donation_link", label: "Donation Link" },
  ],
  request: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "request_type", label: "Request Type" },
    { key: "urgency_level", label: "Urgency Level" },
    { key: "location", label: "Location" },
    { key: "deadline", label: "Deadline" },
    { key: "contact_email", label: "Contact Email" },
    { key: "contact_phone", label: "Contact Phone" },
  ],
  scholarship: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount" },
    { key: "eligibility_criteria", label: "Eligibility Criteria" },
    { key: "application_deadline", label: "Application Deadline" },
    { key: "contact_email", label: "Contact Email" },
    { key: "contact_phone", label: "Contact Phone" },
    { key: "scholarship_link", label: "Scholarship Link" },
    { key: "images", label: "Images" },
  ],
  event: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "location", label: "Location" },
    { key: "max_participants", label: "Max Participants" },
    { key: "event_link", label: "Event Link" },
    { key: "images", label: "Images" },
  ],
  volunteer: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "location", label: "Location" },
    { key: "max_participants", label: "Max Participants" },
    { key: "volunteer_link", label: "Volunteer Link" },
    { key: "images", label: "Images" },
  ],
};

interface RequestChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  contentId: string;
  onSubmit: () => void;
}

export const RequestChangesModal = ({
  open,
  onOpenChange,
  contentType,
  contentId,
  onSubmit,
}: RequestChangesModalProps) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fields = FIELDS_BY_TYPE[contentType];

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Select Fields",
        description: "Please select at least one field that needs changes.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Add Comment",
        description: "Please describe what changes are needed.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      // Build the change request comment
      const fieldLabels = selectedFields
        .map((key) => fields.find((f) => f.key === key)?.label || key)
        .join(", ");

      const fullComment = `📋 **Changes Requested**\n\n**Fields to update:** ${fieldLabels}\n\n**Details:** ${comment.trim()}`;

      // Post as a comment on the content
      const { error } = await supabase.from("comments").insert({
        content: fullComment,
        content_type: contentType,
        content_id: contentId,
        creator_user_id: user.id,
      });

      if (error) throw error;

      // Call the original requestChanges handler (updates approval status)
      onSubmit();

      // Reset and close
      setSelectedFields([]);
      setComment("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting change request:", error);
      toast({
        title: "Error",
        description: "Failed to submit change request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedFields([]);
      setComment("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Select the fields that need changes and describe what should be updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Fields that need changes
            </Label>
            <ScrollArea className="h-48 border rounded-md p-3">
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.key}`}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => toggleField(field.key)}
                    />
                    <Label
                      htmlFor={`field-${field.key}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <Label htmlFor="change-comment" className="text-sm font-medium mb-2 block">
              Describe the requested changes
            </Label>
            <Textarea
              id="change-comment"
              placeholder="Please describe what needs to be changed..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
