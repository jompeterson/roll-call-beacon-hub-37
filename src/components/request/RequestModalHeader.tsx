
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareButton } from "../ShareButton";

interface RequestModalHeaderProps {
  title: string;
}

export const RequestModalHeader = ({ title }: RequestModalHeaderProps) => {
  return (
    <div className="flex-shrink-0 p-6 border-b">
      <DialogHeader>
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <p className="text-sm text-muted-foreground">Request a Donation</p>
          </div>
          <ShareButton />
        </div>
      </DialogHeader>
    </div>
  );
};
