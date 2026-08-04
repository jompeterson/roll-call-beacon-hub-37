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

interface WaiverStepProps {
  data: RegistrationData;
  onNext: () => void;
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
    onUpdate({ waiverAgreed: true, waiverSignatureName: signature.trim() });
    onNext();
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
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                I hereby acknowledge that this is a community service project I choose to
                participate in as a volunteer and pledge to always work safely and will notify
                Home Building Foundation (HBF) representatives if I see an unsafe situation.
              </p>
              <p>
                I recognize the risks inherent in performing light construction tasks, working
                with tools and ladders, working with landscaping, painting and/or general site
                cleanup tasks. In consideration of being a volunteer I do hereby assume all risk
                of onsite injury and all medical expense incurred from any injury resulting from
                my volunteer participation.
              </p>
              <p>
                I (on my and my spouse's behalf) hereby release and hold harmless the nonprofit
                organization(s) where I will be assigned and perform work, their building
                owner(s), the Home Builders Foundation of Metropolitan Portland, their officers,
                directors, members and volunteers, collectively and individually, the Home
                Building Association of Greater Portland, their officers, directors, members and
                volunteers, collectively and individually, from any claims, liabilities, causes of
                action, legal fees and expenses, and any other costs arising as a result of my
                participation in said projects, including without limitation, claims resulting in
                personal injury, death, damage to my property or property of others.
              </p>
              <p>
                I understand that I am to receive no payment for said services. I am not an
                employee of HBF or HBA. I will not be entitled to and will not receive Worker's
                Compensation benefits or other similar payments in the event that I am injured.
              </p>
              <p>
                I acknowledge that I have read, fully understand and am voluntarily signing this
                release without inducement.
              </p>
            </div>
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
