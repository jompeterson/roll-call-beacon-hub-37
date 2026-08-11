import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface AskForDonationButtonProps {
  donationId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export const AskForDonationButton = ({
  donationId,
  className,
  size = "sm",
}: AskForDonationButtonProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const checkAcceptance = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("donation_acceptances")
        .select("id")
        .eq("donation_id", donationId)
        .eq("user_id", user.id)
        .maybeSingle();
      setHasAccepted(!!data);
    };

    checkAcceptance();
  }, [donationId, user]);

  const handleAcceptDonation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to accept donations.",
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from("donation_acceptances")
        .insert({ donation_id: donationId, user_id: user.id });

      if (error) throw error;

      setHasAccepted(true);
      setShowConfirmDialog(true);
      queryClient.invalidateQueries({ queryKey: ["donation-requesters", donationId] });
    } catch (error) {
      console.error("Error accepting donation:", error);
      toast({
        title: "Error",
        description: "Failed to accept donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        onClick={handleAcceptDonation}
        disabled={hasAccepted || isAccepting}
        size={size}
        style={hasAccepted ? {} : { backgroundColor: "#3d7471" }}
        className={
          hasAccepted
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "text-white hover:opacity-90"
        }
      >
        {hasAccepted ? "Already Asked" : isAccepting ? "Asking..." : "Ask for this Donation"}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank You!</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for your interest in this donation. The admin has been notified and will be in contact with you soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowConfirmDialog(false)}>Got it</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
