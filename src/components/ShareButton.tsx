
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SHARE_TYPES = ["donations", "requests", "events", "volunteers", "scholarships"];

// Post links go through a preview page so shared links show the post's own title
export function buildShareLink(loc: Location = window.location): string {
  const m = loc.pathname.match(/^\/([a-z]+)\/([0-9a-f-]{36})\/?$/i);
  if (!m || !SHARE_TYPES.includes(m[1])) return loc.href;
  const params = new URLSearchParams({ type: m[1], id: m[2], app: loc.origin });
  return `https://lkfiueromkmdtgubqlxj.supabase.co/functions/v1/share-preview?${params}`;
}

interface ShareButtonProps {
  title?: string;
  className?: string;
}

export const ShareButton = ({ title = "Share", className }: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(buildShareLink());
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      <Share2 className="h-4 w-4 mr-2" />
      {title}
    </Button>
  );
};
