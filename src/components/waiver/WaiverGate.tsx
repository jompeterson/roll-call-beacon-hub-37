import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { customAuth } from "@/lib/customAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { WaiverText } from "./WaiverText";

export const WaiverGate = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [needsWaiver, setNeedsWaiver] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const check = async () => {
    const current = customAuth.getUser();
    if (!current) {
      setNeedsWaiver(false);
      setChecking(false);
      return;
    }
    setUserId(current.id);
    const { data } = await supabase
      .from("user_profiles")
      .select("waiver_agreed, first_name, last_name")
      .eq("id", current.id)
      .maybeSingle();

    if (data) {
      setNeedsWaiver(!data.waiver_agreed);
      setSignature((prev) => prev || `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim());
    } else {
      setNeedsWaiver(false);
    }
    setChecking(false);
  };

  useEffect(() => {
    check();
    const unsubscribe = customAuth.onAuthStateChange(() => {
      setChecking(true);
      check();
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !agreed || signature.trim().length < 2) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({
        waiver_agreed: true,
        waiver_agreed_at: new Date().toISOString(),
        waiver_signature_name: signature.trim(),
      })
      .eq("id", userId);
    setSubmitting(false);
    if (error) {
      toast({
        title: "Could not save waiver",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setNeedsWaiver(false);
  };

  if (checking || !needsWaiver) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-foreground">Volunteer Liability Release Form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Before continuing, please read the release below and sign it.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <ScrollArea className="h-64 rounded-md border p-4">
            <WaiverText />
          </ScrollArea>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="gate-waiver-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="gate-waiver-agree" className="text-sm font-normal leading-snug">
              I have read, fully understand, and agree to the Volunteer Liability Release Form.
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gate-waiver-signature">Type your full name as signature</Label>
            <Input
              id="gate-waiver-signature"
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
              "Agree & Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
