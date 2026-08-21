import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { customAuth } from "@/lib/customAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { WaiverText } from "./WaiverText";

interface WaiverSignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSigned: () => void;
}

export const WaiverSignDialog = ({ open, onOpenChange, onSigned }: WaiverSignDialogProps) => {
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const current = customAuth.getUser();
      if (!current) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("first_name, last_name")
        .eq("id", current.id)
        .maybeSingle();
      if (data) {
        setSignature(
          (prev) => prev || `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim()
        );
      }
    };
    load();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = customAuth.getUser();
    if (!current || !agreed || signature.trim().length < 2) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({
        waiver_agreed: true,
        waiver_agreed_at: new Date().toISOString(),
        waiver_signature_name: signature.trim(),
      })
      .eq("id", current.id);
    setSubmitting(false);
    if (error) {
      toast({
        title: "Could not save waiver",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    onOpenChange(false);
    onSigned();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Volunteer Liability Release Form</DialogTitle>
          <DialogDescription>
            Before showing interest in a volunteer opportunity, please read and sign the release
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <ScrollArea className="h-64 rounded-md border p-4">
            <WaiverText />
          </ScrollArea>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="interest-waiver-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="interest-waiver-agree" className="text-sm font-normal leading-snug">
              I have read, fully understand, and agree to the Volunteer Liability Release Form.
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-waiver-signature">Type your full name as signature</Label>
            <Input
              id="interest-waiver-signature"
              value={signature}
              maxLength={120}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="First and last name"
              required
            />
            <p className="text-xs text-muted-foreground">
              Date: {formatDate(new Date().toISOString())}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!agreed || signature.trim().length < 2 || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Agree & Show Interest"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
