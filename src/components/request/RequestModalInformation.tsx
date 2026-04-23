
import type { Request } from "@/hooks/useRequests";
import { formatDate, cn } from "@/lib/utils";

interface RequestModalInformationProps {
  request: Request;
  highlightedFields?: string[];
}

const FieldWrapper = ({ fieldKey, highlightedFields, children }: { fieldKey: string; highlightedFields?: string[]; children: React.ReactNode }) => {
  const isHighlighted = highlightedFields?.includes(fieldKey);
  return (
    <div className={cn(isHighlighted && "bg-destructive/10 border border-destructive/30 rounded-md p-2 -mx-2")}>
      {children}
    </div>
  );
};

export const RequestModalInformation = ({ request, highlightedFields }: RequestModalInformationProps) => {
  const getDonationNeedBy = (deadline: string | null) => {
    if (deadline) {
      return formatDate(deadline);
    }
    return "Not specified";
  };

  const labelClass = (fieldKey: string) =>
    cn("font-medium text-sm", highlightedFields?.includes(fieldKey) ? "text-destructive" : "text-muted-foreground");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Request Information</h3>
        <div className="space-y-4">
          <FieldWrapper fieldKey="request_type" highlightedFields={highlightedFields}>
            <div>
              <label className={labelClass("request_type")}>Request Type</label>
              <p className="text-base mt-1">{request.request_type}</p>
            </div>
          </FieldWrapper>
          <FieldWrapper fieldKey="title" highlightedFields={highlightedFields}>
            <div>
              <label className={labelClass("title")}>Requested Item</label>
              <p className="text-base mt-1">{request.title}</p>
            </div>
          </FieldWrapper>
          {request.description && (
            <FieldWrapper fieldKey="description" highlightedFields={highlightedFields}>
              <div>
                <label className={labelClass("description")}>Request Details</label>
                <p className="text-base mt-1">{request.description}</p>
              </div>
            </FieldWrapper>
          )}
          <FieldWrapper fieldKey="deadline" highlightedFields={highlightedFields}>
            <div>
              <label className={labelClass("deadline")}>Donation Need By</label>
              <p className="text-base mt-1">{getDonationNeedBy(request.deadline)}</p>
            </div>
          </FieldWrapper>
          {request.location && (
            <FieldWrapper fieldKey="location" highlightedFields={highlightedFields}>
              <div>
                <label className={labelClass("location")}>Location</label>
                <p className="text-base mt-1">{request.location}</p>
              </div>
            </FieldWrapper>
          )}
          {request.urgency_level && (
            <FieldWrapper fieldKey="urgency_level" highlightedFields={highlightedFields}>
              <div>
                <label className={labelClass("urgency_level")}>Urgency Level</label>
                <p className="text-base mt-1">{request.urgency_level}</p>
              </div>
            </FieldWrapper>
          )}
          {request.contact_email && (
            <FieldWrapper fieldKey="contact_email" highlightedFields={highlightedFields}>
              <div>
                <label className={labelClass("contact_email")}>Contact Email</label>
                <p className="text-base mt-1">{request.contact_email}</p>
              </div>
            </FieldWrapper>
          )}
          {request.contact_phone && (
            <FieldWrapper fieldKey="contact_phone" highlightedFields={highlightedFields}>
              <div>
                <label className={labelClass("contact_phone")}>Contact Phone</label>
                <p className="text-base mt-1">{request.contact_phone}</p>
              </div>
            </FieldWrapper>
          )}
          {Number((request as any).quantity) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Quantity</label>
              <p className="text-base mt-1">{(request as any).quantity}</p>
            </div>
          )}
          {Number((request as any).dimensions) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Dimensions</label>
              <p className="text-base mt-1">
                {(request as any).dimensions}{" "}
                {(request as any).dimension_unit === "square_feet"
                  ? "sq ft"
                  : (request as any).dimension_unit === "linear_feet"
                  ? "linear ft"
                  : ""}
              </p>
            </div>
          )}
          <div>
            <label className="font-medium text-sm text-muted-foreground">Needs Dropoff</label>
            <p className="text-base mt-1">{request.needs_pickup ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
