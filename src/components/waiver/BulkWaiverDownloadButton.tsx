import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { downloadWaiversPdf } from "@/lib/waiverPdf";

interface WaiverUser {
  first_name?: string | null;
  last_name?: string | null;
  waiver_agreed?: boolean | null;
  waiver_agreed_at?: string | null;
  waiver_signature_name?: string | null;
}

interface BulkWaiverDownloadButtonProps {
  /** Pre-loaded users to pull signed waivers from */
  users?: WaiverUser[];
  /** When provided, signed waivers are fetched for this organization */
  organizationId?: string;
  fileName?: string;
  label?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

const toWaiver = (user: WaiverUser) => ({
  fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
  signatureName: user.waiver_signature_name,
  signedAt: user.waiver_agreed_at,
});

export const BulkWaiverDownloadButton = ({
  users,
  organizationId,
  fileName = "waivers",
  label = "Download Waivers",
  size = "sm",
  variant = "outline",
  className,
}: BulkWaiverDownloadButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      let source: WaiverUser[] = users || [];

      if (organizationId) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("first_name, last_name, waiver_agreed, waiver_agreed_at, waiver_signature_name")
          .eq("organization_id", organizationId);

        if (error) throw error;
        source = (data as any as WaiverUser[]) || [];
      }

      const signed = source.filter((u) => u.waiver_agreed);

      if (!signed.length) {
        toast({
          title: "No signed waivers",
          description: "There are no signed waivers available to download.",
        });
        return;
      }

      await downloadWaiversPdf(signed.map(toWaiver), fileName);

      toast({
        title: "Waivers downloaded",
        description: `${signed.length} signed waiver${signed.length === 1 ? "" : "s"} exported.`,
      });
    } catch (error) {
      console.error("Error downloading waivers:", error);
      toast({
        title: "Error",
        description: "Failed to download waivers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {size !== "icon" && <span className="ml-2">{label}</span>}
    </Button>
  );
};
