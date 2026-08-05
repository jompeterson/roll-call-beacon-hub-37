import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PrivatePostToggleProps {
  isPrivate: boolean;
  onChange: (value: boolean) => void;
  id?: string;
}

/**
 * Toggle shown on post create/edit forms so the poster can mark the post as
 * Private — hidden from everyone except the poster and administrators.
 */
export const PrivatePostToggle = ({
  isPrivate,
  onChange,
  id = "post-is-private",
}: PrivatePostToggleProps) => {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 px-3 py-3">
      <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          Make this post Private
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Only you and administrators will be able to see it.
        </p>
      </div>
      <Switch id={id} checked={isPrivate} onCheckedChange={onChange} />
    </div>
  );
};
