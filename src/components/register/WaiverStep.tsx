import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { RegistrationData } from "@/pages/Register";
import { formatDate } from "@/lib/utils";
import { WaiverText } from "@/components/waiver/WaiverText";

interface WaiverStepProps {
  data: RegistrationData;
  onNext: (overrides?: Partial<RegistrationData>) => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
  isSubmitting?: boolean;
}

export const WaiverStep = ({ data, onNext, onBack, onUpdate, isSubmitting }: WaiverStepProps) => {
  const [agreed, setAgreed] = useState(data.waiverAgreed ?? false);
  const [signature, setSignature] = useState(
    data.waiverSignatureName ?? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()
  );

  const canContinue = agreed && signature.trim().length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    const values = { waiverAgreed: true, waiverSignatureName: signature.trim() };
    onUpdate(values);
    onNext(values);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Volunteer Liability Release Form</CardTitle>
        <CardDescription>
          Please read the release below and sign to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          <ScrollArea className="h-64 rounded-md border p-4">
            <WaiverText />
          </ScrollArea>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="waiver-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="waiver-agree" className="text-sm leading-snug font-normal">
              I have read, fully understand, and agree to the Volunteer Liability Release Form.
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waiver-signature">Type your full name as signature</Label>
            <Input
              id="waiver-signature"
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

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={!canContinue || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Agree & Continue"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
