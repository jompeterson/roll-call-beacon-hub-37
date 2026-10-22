
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RequestModalCreatorInfoProps {
  creatorUserId: string;
  organizationName?: string | null;
  open?: boolean;
  createdAt: string;
}

export const RequestModalCreatorInfo = ({ creatorUserId, organizationName, open = true, createdAt }: RequestModalCreatorInfoProps) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["request-creator", creatorUserId],
    enabled: open && Boolean(creatorUserId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email, organizations!user_profiles_organization_id_fkey(name)")
        .eq("id", creatorUserId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "";
  const organization = organizationName || profile?.organizations?.name;

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-base">{isLoading ? "Loading..." : name || "Poster information unavailable"}</h4>
          {profile?.email && <p className="text-sm text-muted-foreground break-all">{profile.email}</p>}
          {organization && <p className="text-sm text-muted-foreground">{organization}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Posted on</p>
          <p className="text-sm font-medium">{formatDate(createdAt)}</p>
        </div>
      </div>
    </div>
  );
};
