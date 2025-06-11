
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

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

interface ScholarshipModalProps {
  scholarship: Scholarship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isRequestingChanges?: boolean;
}

export const ScholarshipModal = ({
  scholarship,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
  isApproving = false,
  isRejecting = false,
  isRequestingChanges = false,
}: ScholarshipModalProps) => {
  const { isAdministrator } = useAuth();

  if (!scholarship) return null;

  const getStatusBadge = () => {
    if (scholarship.approval_decision_made) {
      return scholarship.is_approved ? (
        <Badge className="bg-green-100 text-green-800">Approved</Badge>
      ) : (
        <Badge variant="destructive">Rejected</Badge>
      );
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

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

  const showActionButtons = isAdministrator && !scholarship.approval_decision_made;

  // Get organization name from relationship or fallback to the stored name
  const organizationName = scholarship.organization?.name || scholarship.organization_name || "Unknown Organization";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {scholarship.title}
            </DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

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
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Creator</h4>
              <p className="text-sm">{scholarship.creator?.email || "Unknown"}</p>
            </div>
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

          <div className="text-xs text-muted-foreground">
            <p>Created: {formatDate(scholarship.created_at)}</p>
            <p>Last Updated: {formatDate(scholarship.updated_at)}</p>
          </div>
        </div>

        {showActionButtons && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onApprove(scholarship.id)}
              disabled={isApproving}
              className="flex-1"
            >
              {isApproving ? "Approving..." : "Approve Scholarship"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(scholarship.id)}
              disabled={isRejecting}
              className="flex-1"
            >
              {isRejecting ? "Rejecting..." : "Reject Scholarship"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onRequestChanges(scholarship.id)}
              disabled={isRequestingChanges}
              className="flex-1"
            >
              {isRequestingChanges ? "Requesting..." : "Request Changes"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
