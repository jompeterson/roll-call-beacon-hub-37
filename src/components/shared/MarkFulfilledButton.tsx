import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCcw, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlatformUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url: string | null;
}

interface MarkFulfilledButtonProps {
  /** "donations" or "requests" */
  table: "donations" | "requests";
  /** Column that stores the fulfilled state */
  column: "is_taken" | "is_completed";
  recordId: string;
  isFulfilled: boolean;
  markLabel: string;
  undoLabel: string;
  successMessage: string;
  undoMessage: string;
  /** Only admins can undo */
  canUndo?: boolean;
  /** When true, ask which platform user received the donation */
  selectRecipient?: boolean;
}

export const MarkFulfilledButton = ({
  table,
  column,
  recordId,
  isFulfilled,
  markLabel,
  undoLabel,
  successMessage,
  undoMessage,
  canUndo = false,
  selectRecipient = false,
}: MarkFulfilledButtonProps) => {
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["platform-users-for-recipient"],
    enabled: selectRecipient && dialogOpen,
    queryFn: async (): Promise<PlatformUser[]> => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name, email, profile_image_url")
        .eq("is_approved", true)
        .order("first_name", { ascending: true });
      if (error) {
        console.error("Error loading users:", error);
        return [];
      }
      return data || [];
    },
  });

  const selectedUser = users.find((u) => u.id === recipientId) || null;
  const fullName = (u: PlatformUser) => `${u.first_name} ${u.last_name}`;
  const initials = (u: PlatformUser) =>
    `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase() || "?";

  const notifyRecipient = async (userId: string) => {
    const { data: donation } = await supabase
      .from("donations")
      .select("title, creator_user_id")
      .eq("id", recordId)
      .maybeSingle();

    const title = donation?.title || "a donation";
    const creatorId = donation?.creator_user_id || null;
    const recipientName = selectedUser ? fullName(selectedUser) : "the selected recipient";

    const notifications: any[] = [
      {
        user_id: userId,
        type: "new_post",
        title: "You Were Selected to Receive a Donation",
        message: `You have been selected to receive the donation "${title}". The donor will be in touch with you soon.`,
        related_content_type: "donation",
        related_content_id: recordId,
        creator_user_id: creatorId,
      },
    ];

    if (creatorId && creatorId !== userId) {
      notifications.push({
        user_id: creatorId,
        type: "new_post",
        title: "Recipient Confirmed",
        message: `You selected ${recipientName} to receive your donation "${title}".`,
        related_content_type: "donation",
        related_content_id: recordId,
        creator_user_id: creatorId,
      });
    }

    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) console.error("Error sending notifications:", error);
  };

  const update = async (value: boolean, userId?: string | null) => {
    setSaving(true);
    const payload: Record<string, unknown> = { [column]: value };
    if (selectRecipient) {
      payload.selected_recipient_user_id = value ? userId ?? null : null;
    }

    const { error } = await supabase
      .from(table)
      .update(payload as never)
      .eq("id", recordId);

    if (error) {
      setSaving(false);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (value && selectRecipient && userId) {
      await notifyRecipient(userId);
    }

    setSaving(false);
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: [table] });
    queryClient.invalidateQueries({ queryKey: ["donation-requesters", recordId] });
    toast({ title: value ? successMessage : undoMessage });
  };

  if (isFulfilled) {
    if (!canUndo) return null;
    return (
      <Button variant="outline" onClick={() => update(false)} disabled={saving}>
        <RotateCcw className="w-4 h-4 mr-2" />
        {undoLabel}
      </Button>
    );
  }

  if (!selectRecipient) {
    return (
      <Button
        onClick={() => update(true)}
        disabled={saving}
        style={{ backgroundColor: "#3d7471" }}
        className="text-white hover:opacity-90"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        {markLabel}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={saving}
        style={{ backgroundColor: "#3d7471" }}
        className="text-white hover:opacity-90"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        {markLabel}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{markLabel}</DialogTitle>
            <DialogDescription>
              Select which user on the platform took this donation. They will be notified.
            </DialogDescription>
          </DialogHeader>

          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={pickerOpen}
                className="w-full justify-between font-normal"
              >
                {selectedUser ? fullName(selectedUser) : "Choose a recipient..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandList>
                  <CommandEmpty>
                    {usersLoading ? "Loading users..." : "No users found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {users.map((u) => (
                      <CommandItem
                        key={u.id}
                        value={`${fullName(u)} ${u.email}`}
                        onSelect={() => {
                          setRecipientId(u.id);
                          setPickerOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            recipientId === u.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <Avatar className="h-7 w-7 mr-2">
                          <AvatarImage
                            src={u.profile_image_url || undefined}
                            alt={fullName(u)}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs">{initials(u)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate">{fullName(u)}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={() => update(true, recipientId)}
              disabled={saving || !recipientId}
              style={{ backgroundColor: "#3d7471" }}
              className="text-white hover:opacity-90"
            >
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
