
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusIconProps {
  isApproved: boolean;
  decisionMade: boolean;
}

export const StatusIcon = ({ isApproved, decisionMade }: StatusIconProps) => {
  if (!decisionMade) {
    return <Clock className="h-4 w-4 text-yellow-600" />;
  }
  
  if (isApproved) {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  } else {
    return <XCircle className="h-4 w-4 text-red-600" />;
  }
};
