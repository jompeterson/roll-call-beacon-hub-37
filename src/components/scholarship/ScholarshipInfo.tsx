
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";

type Scholarship = Tables<"scholarships"> & {
  creator?: {
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  };
};

interface ScholarshipInfoProps {
  scholarship: Scholarship;
  isAuthenticated: boolean;
}

export const ScholarshipInfo = ({ scholarship, isAuthenticated }: ScholarshipInfoProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const organizationName = scholarship.organization?.name || scholarship.organization_name || "Unknown Organization";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Organization</h4>
          <p className="text-sm">{organizationName}</p>
          {scholarship.organization?.type && (
            <p className="text-xs text-muted-foreground">{scholarship.organization.type}</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Amount</h4>
          <p className="text-sm">{formatCurrency(Number(scholarship.amount))}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Application Deadline</h4>
          <p className="text-sm">{formatDate(scholarship.application_deadline)}</p>
        </div>
        {isAuthenticated && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Creator</h4>
            <p className="text-sm">{scholarship.creator?.email || "Unknown"}</p>
          </div>
        )}
      </div>

      <Separator />

      {scholarship.description && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
          <p className="text-sm whitespace-pre-wrap">{scholarship.description}</p>
        </div>
      )}

      {scholarship.eligibility_criteria && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Eligibility Criteria</h4>
          <p className="text-sm whitespace-pre-wrap">{scholarship.eligibility_criteria}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scholarship.contact_email && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Contact Email</h4>
            <p className="text-sm">{scholarship.contact_email}</p>
          </div>
        )}
        {scholarship.contact_phone && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Contact Phone</h4>
            <p className="text-sm">{scholarship.contact_phone}</p>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="text-xs text-muted-foreground">
          <p>Created: {formatDate(scholarship.created_at)}</p>
          <p>Last Updated: {formatDate(scholarship.updated_at)}</p>
        </div>
      )}
    </div>
  );
};
