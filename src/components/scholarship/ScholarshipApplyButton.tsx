
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ScholarshipApplyButtonProps {
  scholarshipLink: string | null;
  onApply: () => void;
}

export const ScholarshipApplyButton = ({ scholarshipLink, onApply }: ScholarshipApplyButtonProps) => {
  if (!scholarshipLink || scholarshipLink.trim() === '') {
    return null;
  }

  return (
    <Button
      onClick={onApply}
      className="w-full flex items-center gap-2"
      size="lg"
    >
      <ExternalLink className="h-4 w-4" />
      Apply to Scholarship
    </Button>
  );
};
