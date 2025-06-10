
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RefreshCw, Clock } from "lucide-react";
import { RegistrationData } from "@/pages/Register";

interface VerificationPendingStepProps {
  data: RegistrationData;
  onRefresh: () => void;
}

export const VerificationPendingStep = ({ data, onRefresh }: VerificationPendingStepProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Registration Submitted</h2>
        <p className="text-muted-foreground mt-2">
          Your registration is pending administrator approval
        </p>
      </div>

      {/* Status Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Registration Complete!</h3>
              <p className="text-muted-foreground">
                We've received your registration for <strong>{data.email}</strong>
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• An administrator will review your registration</li>
              <li>• You'll receive an email once your account is approved</li>
              <li>• This process typically takes 1-2 business days</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={onRefresh} variant="outline" className="w-full h-12">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Verification Status
            </Button>
            <p className="text-xs text-muted-foreground">
              Click refresh to check if your account has been approved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back to Login */}
      <div className="text-center">
        <Button variant="ghost" asChild>
          <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Login
          </a>
        </Button>
      </div>
    </div>
  );
};
