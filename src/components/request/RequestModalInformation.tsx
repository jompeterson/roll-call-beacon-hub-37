
import type { Request } from "@/hooks/useRequests";

interface RequestModalInformationProps {
  request: Request;
}

export const RequestModalInformation = ({ request }: RequestModalInformationProps) => {
  const getDonationNeedBy = (deadline: string | null) => {
    if (deadline) {
      return new Date(deadline).toLocaleDateString();
    }
    return "Not specified";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Request Information</h3>
        <div className="space-y-4">
          <div>
            <label className="font-medium text-sm text-muted-foreground">Request Type</label>
            <p className="text-base mt-1">{request.request_type}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-muted-foreground">Requested Item</label>
            <p className="text-base mt-1">{request.title}</p>
          </div>
          {request.description && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Request Details</label>
              <p className="text-base mt-1">{request.description}</p>
            </div>
          )}
          <div>
            <label className="font-medium text-sm text-muted-foreground">Donation Need By</label>
            <p className="text-base mt-1">{getDonationNeedBy(request.deadline)}</p>
          </div>
          {request.location && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Location</label>
              <p className="text-base mt-1">{request.location}</p>
            </div>
          )}
          {request.urgency_level && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Urgency Level</label>
              <p className="text-base mt-1">{request.urgency_level}</p>
            </div>
          )}
          {request.contact_email && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Contact Email</label>
              <p className="text-base mt-1">{request.contact_email}</p>
            </div>
          )}
          {request.contact_phone && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Contact Phone</label>
              <p className="text-base mt-1">{request.contact_phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
