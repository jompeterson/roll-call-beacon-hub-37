
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";
import { formatDate, cn } from "@/lib/utils";

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
  highlightedFields?: string[];
}

const FieldWrapper = ({ fieldKey, highlightedFields, children }: { fieldKey: string; highlightedFields?: string[]; children: React.ReactNode }) => {
  const isHighlighted = highlightedFields?.includes(fieldKey);
  return (
    <div className={cn(isHighlighted && "bg-destructive/10 border border-destructive/30 rounded-md p-2 -m-2")}>
      {children}
    </div>
  );
};

export const ScholarshipInfo = ({ scholarship, isAuthenticated, highlightedFields }: ScholarshipInfoProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const organizationName = scholarship.organization?.name || scholarship.organization_name || "Unknown Organization";

  const labelClass = (fieldKey: string) =>
    cn("font-semibold text-sm mb-1", highlightedFields?.includes(fieldKey) ? "text-destructive" : "text-muted-foreground");

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
        <FieldWrapper fieldKey="amount" highlightedFields={highlightedFields}>
          <div>
            <h4 className={labelClass("amount")}>Amount</h4>
            <p className="text-sm">
              {scholarship.amount != null && Number(scholarship.amount) > 0
                ? scholarship.amount_max != null && Number(scholarship.amount_max) > 0
                  ? `${formatCurrency(Number(scholarship.amount))} – ${formatCurrency(Number(scholarship.amount_max))}`
                  : formatCurrency(Number(scholarship.amount))
                : "--"}
            </p>
          </div>
        </FieldWrapper>
        <FieldWrapper fieldKey="application_deadline" highlightedFields={highlightedFields}>
          <div>
            <h4 className={labelClass("application_deadline")}>Application Deadline</h4>
            <p className="text-sm">{formatDate(scholarship.application_deadline)}</p>
          </div>
        </FieldWrapper>
        {isAuthenticated && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Creator</h4>
            <p className="text-sm">{scholarship.creator?.email || "Unknown"}</p>
          </div>
        )}
      </div>

      <Separator />

      {scholarship.description && (
        <FieldWrapper fieldKey="description" highlightedFields={highlightedFields}>
          <div>
            <h4 className={labelClass("description")}>Description</h4>
            <p className="text-sm whitespace-pre-wrap">{scholarship.description}</p>
          </div>
        </FieldWrapper>
      )}

      {scholarship.eligibility_criteria && (
        <FieldWrapper fieldKey="eligibility_criteria" highlightedFields={highlightedFields}>
          <div>
            <h4 className={labelClass("eligibility_criteria")}>Eligibility Criteria</h4>
            <p className="text-sm whitespace-pre-wrap">{scholarship.eligibility_criteria}</p>
          </div>
        </FieldWrapper>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scholarship.contact_email && (
          <FieldWrapper fieldKey="contact_email" highlightedFields={highlightedFields}>
            <div>
              <h4 className={labelClass("contact_email")}>Contact Email</h4>
              <p className="text-sm">{scholarship.contact_email}</p>
            </div>
          </FieldWrapper>
        )}
        {scholarship.contact_phone && (
          <FieldWrapper fieldKey="contact_phone" highlightedFields={highlightedFields}>
            <div>
              <h4 className={labelClass("contact_phone")}>Contact Phone</h4>
              <p className="text-sm">{scholarship.contact_phone}</p>
            </div>
          </FieldWrapper>
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
