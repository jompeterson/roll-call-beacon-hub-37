
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreatorInfo {
  name: string;
  email: string;
  postedDate: string;
  lastLogin?: string;
}

interface DonationModalCreatorInfoProps {
  creatorUserId?: string;
  createdAt: string;
  orgName: string;
  open: boolean;
  isUser?: boolean;
  getDateLabel: () => string;
}

export const DonationModalCreatorInfo = ({ 
  creatorUserId, 
  createdAt, 
  orgName, 
  open, 
  isUser = false,
  getDateLabel 
}: DonationModalCreatorInfoProps) => {
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!creatorUserId || !open) return;

      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, email')
          .eq('id', creatorUserId)
          .single();

        if (error) {
          console.error('Error fetching creator profile:', error);
          setCreatorInfo({
            name: "Unknown User",
            email: "unknown@example.com",
            postedDate: createdAt
          });
        } else {
          setCreatorInfo({
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            postedDate: createdAt
          });
        }
      } catch (error) {
        console.error('Error fetching creator info:', error);
        setCreatorInfo({
          name: "Unknown User",
          email: "unknown@example.com",
          postedDate: createdAt
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorInfo();
  }, [creatorUserId, createdAt, open]);

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          {loading ? (
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-base">{creatorInfo?.name || "Loading..."}</h4>
              <p className="text-sm text-muted-foreground">{creatorInfo?.email || "Loading..."}</p>
              <p className="text-sm text-muted-foreground">{orgName}</p>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{getDateLabel()}</p>
          <p className="text-sm font-medium">
            {creatorInfo?.postedDate ? new Date(creatorInfo.postedDate).toLocaleDateString() : "Loading..."}
          </p>
          {isUser && creatorInfo && (creatorInfo as any).lastLogin && (
            <>
              <p className="text-sm text-muted-foreground mt-2">Last Login</p>
              <p className="text-sm font-medium">{new Date((creatorInfo as any).lastLogin).toLocaleDateString()}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
