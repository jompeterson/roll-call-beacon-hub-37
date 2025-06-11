
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { ShareButton } from "../ShareButton";

interface EventModalHeaderProps {
  title: string;
}

export const EventModalHeader = ({ title }: EventModalHeaderProps) => {
  return (
    <div className="flex-shrink-0 p-6 border-b">
      <DialogHeader>
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {title}
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
