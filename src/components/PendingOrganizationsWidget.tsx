
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2 } from "lucide-react";
import { useOrganizationsRealtime } from "@/hooks/useOrganizationsRealtime";
import { OrganizationModal } from "@/components/OrganizationModal";
import { useState } from "react";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string;
  address: string;
  contact_user_id: string | null;
  is_approved: boolean;
  approval_decision_made: boolean;
  contact_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export const PendingOrganizationsWidget = () => {
  const { organizations, loading, updateOrganizationContact, approveOrganization, rejectOrganization } = useOrganizationsRealtime();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingOrganizations = organizations.filter(org => !org.approval_decision_made);

  const handleOrganizationClick = (organization: Organization) => {
    setSelectedOrganization(organization);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Card className="h-64">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Organizations</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-64">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Organizations</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {pendingOrganizations.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No pending organizations</div>
          ) : (
            <ScrollArea className="h-44 px-6">
              <div className="space-y-2 py-2">
                {pendingOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleOrganizationClick(org)}
                  >
                    <div className="font-medium text-sm">{org.name}</div>
                    <div className="text-xs text-muted-foreground">{org.type}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <OrganizationModal
        organization={selectedOrganization}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdateContact={updateOrganizationContact}
        onApprove={approveOrganization}
        onReject={rejectOrganization}
        isAdministrator={true}
      />
    </>
  );
};
