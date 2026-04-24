import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PrivateApprovalToggleProps {
  isPrivate: boolean;
  onChange: (value: boolean) => void;
  id?: string;
}

/**
 * Shared toggle shown to admins in approval modals so they can choose
 * to approve a post as Private (visible only to the creator's organization
 * and administrators) instead of fully public.
 */
export const PrivateApprovalToggle = ({
  isPrivate,
  onChange,
  id = "approve-as-private",
}: PrivateApprovalToggleProps) => {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
      <Lock className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
        Approve as Private
      </Label>
      <Switch id={id} checked={isPrivate} onCheckedChange={onChange} />
      <span className="text-xs text-muted-foreground hidden sm:inline">
        (visible only to creator's organization & admins)
      </span>
    </div>
  );
};
