import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ContentType } from "@/components/shared/RequestChangesModal";

interface SubmitForReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  onComplete: () => void;
}

export const SubmitForReviewDialog = ({
  open,
  onOpenChange,
  contentType,
  contentId,
  contentTitle,
  onComplete,
}: SubmitForReviewDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);

    try {
      // 1. Delete all change request comments for this content
      const { error: deleteError } = await supabase
        .from("comments")
        .delete()
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .like("content", "📋%");

      if (deleteError) {
        console.error("Error deleting change request comments:", deleteError);
      }

      // 2. Reset approval status so admins can re-review
      const tableName = contentType === "donation" ? "donations"
        : contentType === "request" ? "requests"
        : contentType === "scholarship" ? "scholarships"
        : contentType === "event" ? "events"
        : "volunteers";

      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          approval_decision_made: false,
          is_approved: false,
        })
        .eq("id", contentId);

      if (updateError) {
        console.error("Error resetting approval status:", updateError);
        throw updateError;
      }

      // 3. Notify all admins
      const { data: admins } = await supabase
        .from("user_profiles")
        .select("id, role_id")
        .eq("is_approved", true);

      if (admins) {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("name", "administrator")
          .single();

        if (adminRole) {
          const adminUsers = admins.filter(a => a.role_id === adminRole.id);

          if (adminUsers.length > 0) {
            const notifications = adminUsers.map(admin => ({
              user_id: admin.id,
              type: "post_resubmitted",
              title: "Post Resubmitted for Review",
              message: `The ${contentType} "${contentTitle}" has been updated and resubmitted for review.`,
              related_content_type: contentType,
              related_content_id: contentId,
            }));

            const { error: notifError } = await supabase
              .from("notifications")
              .insert(notifications);

            if (notifError) {
              console.error("Error creating notifications:", notifError);
            }
          }
        }
      }

      toast({
        title: "Submitted for Review",
        description: "Your changes have been submitted for admin review.",
      });

      onOpenChange(false);
      onComplete();
    } catch (error) {
      console.error("Error submitting for review:", error);
      toast({
        title: "Error",
        description: "Failed to submit for review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    onComplete();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Changes for Review?</AlertDialogTitle>
          <AlertDialogDescription>
            This post had changes requested by an administrator. Would you like to submit your updates for review? The admin will be notified to re-review the post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>
            Not Yet
          </Button>
          <Button onClick={handleSubmitForReview} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
