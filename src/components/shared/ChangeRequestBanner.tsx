import { AlertTriangle } from "lucide-react";

interface ChangeRequestBannerProps {
  comment: string;
  fieldLabels: string[];
}

export const ChangeRequestBanner = ({ comment, fieldLabels }: ChangeRequestBannerProps) => {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <h3 className="font-semibold text-destructive">Changes Requested</h3>
      </div>
      {comment && (
        <p className="text-sm text-destructive/90 ml-7">{comment}</p>
      )}
      <div className="ml-7">
        <p className="text-xs text-destructive/70">
          Fields to update: {fieldLabels.join(", ")}
        </p>
      </div>
    </div>
  );
};
