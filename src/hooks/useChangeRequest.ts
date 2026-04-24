import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ContentType } from "@/components/shared/RequestChangesModal";

interface ChangeRequest {
  fieldLabels: string[];
  fieldKeys: string[];
  comment: string;
  createdAt: string;
}

const FIELD_LABEL_TO_KEY: Record<string, string> = {
  "Title": "title",
  "Description": "description",
  "Donation Type": "donation_type",
  "Amount Needed": "amount_needed",
  "Location": "location",
  "Target Date": "target_date",
  "Contact Email": "contact_email",
  "Contact Phone": "contact_phone",
  "Images": "images",
  "Link to product info": "donation_link",
  "Request Type": "request_type",
  "Urgency Level": "urgency_level",
  "Deadline": "deadline",
  "Amount": "amount",
  "Eligibility Criteria": "eligibility_criteria",
  "Application Deadline": "application_deadline",
  "Scholarship Link": "scholarship_link",
  "Start Date": "start_date",
  "End Date": "end_date",
  "Max Participants": "max_participants",
  "Event Link": "event_link",
  "Volunteer Link": "volunteer_link",
};

function parseChangeRequestComment(content: string): ChangeRequest | null {
  if (!content.startsWith("📋")) return null;

  const fieldsMatch = content.match(/\*\*Fields to update:\*\*\s*(.+?)(?:\n|$)/);
  const detailsMatch = content.match(/\*\*Details:\*\*\s*([\s\S]*?)$/);

  if (!fieldsMatch) return null;

  const fieldLabels = fieldsMatch[1].split(",").map(f => f.trim()).filter(Boolean);
  const fieldKeys = fieldLabels
    .map(label => FIELD_LABEL_TO_KEY[label] || label.toLowerCase().replace(/\s+/g, "_"))
    .filter(Boolean);

  return {
    fieldLabels,
    fieldKeys,
    comment: detailsMatch?.[1]?.trim() || "",
    createdAt: "",
  };
}

export const useChangeRequest = (contentType: ContentType, contentId: string) => {
  const [changeRequest, setChangeRequest] = useState<ChangeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    const fetchChangeRequest = async () => {
      if (!contentId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("comments")
          .select("content, created_at")
          .eq("content_type", contentType)
          .eq("content_id", contentId)
          .like("content", "📋%")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching change request:", error);
          setChangeRequest(null);
        } else if (data) {
          const parsed = parseChangeRequestComment(data.content);
          if (parsed) {
            parsed.createdAt = data.created_at;
          }
          setChangeRequest(parsed);
        } else {
          setChangeRequest(null);
        }
      } catch (err) {
        console.error("Error fetching change request:", err);
        setChangeRequest(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChangeRequest();
  }, [contentType, contentId, refreshKey]);

  return { changeRequest, isLoading, refetch };
};
