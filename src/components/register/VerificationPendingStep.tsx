
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RefreshCw, Clock, Loader } from "lucide-react";
import { RegistrationData } from "@/pages/Register";
import { checkVerificationStatus } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface VerificationPendingStepProps {
  data: RegistrationData;
  onRefresh: () => void;
}

export const VerificationPendingStep = ({ data, onRefresh }: VerificationPendingStepProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    
    try {
      const { isApproved, error } = await checkVerificationStatus(data.email);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to check verification status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (isApproved) {
        toast({
          title: "Account Approved!",
          description: "Your account has been approved. Redirecting to login...",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast({
          title: "Not Approved Yet",
          description: "Your account is still pending approval. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

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
            <Button 
              onClick={handleCheckStatus} 
              variant="outline" 
              className="w-full h-12"
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isChecking ? "Checking Status..." : "Check Verification Status"}
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
