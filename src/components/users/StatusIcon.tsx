
import { CheckCircle, Clock } from "lucide-react";

interface StatusIconProps {
  isApproved: boolean;
}

export const StatusIcon = ({ isApproved }: StatusIconProps) => {
  if (isApproved) {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  } else {
    return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};
