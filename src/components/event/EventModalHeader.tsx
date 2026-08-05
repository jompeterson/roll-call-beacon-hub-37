
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "../ShareButton";

interface EventModalHeaderProps {
  title: string;
  isPrivate?: boolean | null;
}

export const EventModalHeader = ({ title, isPrivate }: EventModalHeaderProps) => {
  return (
    <div className="flex-shrink-0 p-6 border-b">
      <DialogHeader>
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {title}
              {isPrivate && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 gap-1">
                  <Lock className="h-3 w-3" /> Private
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Event details and management
            </DialogDescription>
          </div>
          <ShareButton />
        </div>
      </DialogHeader>
    </div>
  );
};
