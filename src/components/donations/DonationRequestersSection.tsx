import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Requester {
  id: string;
  user_id: string;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

interface DonationRequestersSectionProps {
  donationId: string;
  isTaken: boolean;
  selectedRecipientUserId: string | null;
}

export const DonationRequestersSection = ({
  donationId,
  isTaken,
  selectedRecipientUserId,
}: DonationRequestersSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<Requester | null>(null);

  useEffect(() => {
    const fetchRequesters = async () => {
      setLoading(true);
      const { data: acceptances, error } = await supabase
        .from("donation_acceptances")
        .select("id, user_id, created_at")
        .eq("donation_id", donationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading requesters:", error);
        setLoading(false);
        return;
      }

      const userIds = (acceptances || []).map((a) => a.user_id);
      let profilesMap: Record<string, Requester["profile"]> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, email, profile_image_url")
          .in("id", userIds);
        (profiles || []).forEach((p) => {
          profilesMap[p.id] = {
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            profile_image_url: p.profile_image_url,
          };
        });
      }

      setRequesters(
        (acceptances || []).map((a) => ({
          ...a,
          profile: profilesMap[a.user_id] || null,
        }))
      );
      setLoading(false);
    };

    fetchRequesters();

    const channel = supabase
      .channel(`donation-acceptances-${donationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donation_acceptances", filter: `donation_id=eq.${donationId}` },
        () => fetchRequesters()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donationId]);

  const handleSelectRecipient = async (userId: string) => {
    setPendingUserId(userId);
    try {
      const { error } = await supabase
        .from("donations")
        .update({
          selected_recipient_user_id: userId,
          is_taken: true,
        })
        .eq("id", donationId);

      if (error) throw error;

      toast({
        title: "Recipient selected",
        description: "The donation has been marked as taken.",
      });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    } catch (err) {
      console.error("Error selecting recipient:", err);
      toast({
        title: "Error",
        description: "Failed to select recipient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingUserId(null);
      setConfirmUser(null);
    }
  };

  const initials = (r: Requester) => {
    const f = r.profile?.first_name?.[0] || "";
    const l = r.profile?.last_name?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          People Requesting This Donation
          {requesters.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({requesters.length})
            </span>
          )}
        </h3>
        {isTaken && (
          <Badge className="ml-auto bg-green-600 text-white hover:bg-green-600">
            Taken
          </Badge>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading requesters...</p>
      ) : requesters.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No one has requested this donation yet.
        </p>
      ) : (
        <div className="space-y-3">
          {requesters.map((r) => {
            const isSelected = selectedRecipientUserId === r.user_id;
            const fullName = r.profile
              ? `${r.profile.first_name} ${r.profile.last_name}`
              : "Unknown User";

            return (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-md border ${
                  isSelected ? "border-green-600 bg-green-50 dark:bg-green-950/20" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={r.profile?.profile_image_url || undefined}
                      alt={fullName}
                      className="object-cover"
                    />
                    <AvatarFallback>{initials(r)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.profile?.email && (
                        <a
                          href={`mailto:${r.profile.email}`}
                          className="hover:underline"
                        >
                          {r.profile.email}
                        </a>
                      )}
                      <span className="mx-1">·</span>
                      Requested {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <Badge className="bg-green-600 text-white hover:bg-green-600 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                ) : isTaken ? (
                  <Badge variant="secondary" className="flex-shrink-0">
                    Not selected
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setConfirmUser(r)}
                    disabled={pendingUserId !== null}
                    style={{ backgroundColor: "#3d7471" }}
                    className="text-white hover:opacity-90 flex-shrink-0"
                  >
                    Select Recipient
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!confirmUser}
        onOpenChange={(open) => !open && setConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Recipient Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to give this donation to{" "}
              <strong>
                {confirmUser?.profile
                  ? `${confirmUser.profile.first_name} ${confirmUser.profile.last_name}`
                  : "this user"}
              </strong>
              ? This will mark the donation as taken.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmUser && handleSelectRecipient(confirmUser.user_id)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
