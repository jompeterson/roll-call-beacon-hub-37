
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2 } from "lucide-react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { OrganizationModal } from "@/components/OrganizationModal";
import { useAuth } from "@/hooks/useAuth";

export const PendingOrganizationsWidget = () => {
  const { organizations, updateOrganizationContact, approveOrganization, rejectOrganization } = useOrganizations();
  const { isAdministrator } = useAuth();
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingOrganizations = organizations.filter(org => !org.approval_decision_made);

  const handleOrganizationClick = (organization: any) => {
    setSelectedOrganization(organization);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="cursor-pointer" onClick={() => {}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Organizations</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{pendingOrganizations.length}</div>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {pendingOrganizations.slice(0, 5).map((org) => (
                <div
                  key={org.id}
                  className="text-xs p-2 rounded bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrganizationClick(org);
                  }}
                >
                  <div className="font-medium truncate">{org.name}</div>
                  <div className="text-muted-foreground truncate">{org.type}</div>
                </div>
              ))}
              {pendingOrganizations.length > 5 && (
                <div className="text-xs text-muted-foreground text-center p-1">
                  +{pendingOrganizations.length - 5} more...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <OrganizationModal
        organization={selectedOrganization}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdateContact={updateOrganizationContact}
        onApprove={approveOrganization}
        onReject={rejectOrganization}
        isAdministrator={isAdministrator}
      />
    </>
  );
};
