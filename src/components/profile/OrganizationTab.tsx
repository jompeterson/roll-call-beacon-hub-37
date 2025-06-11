
import { CurrentOrganization } from "./CurrentOrganization";
import { OrganizationSearch } from "./OrganizationSearch";

interface OrganizationData {
  name: string;
  role: string;
  joinedDate: string;
  logo: string;
}

interface OrganizationTabProps {
  organizationData: OrganizationData | null;
  userOrganizationId?: string | null;
}

export const OrganizationTab = ({ organizationData, userOrganizationId }: OrganizationTabProps) => {
  return (
    <div className="space-y-6">
      {organizationData ? (
        <CurrentOrganization 
          organization={organizationData} 
          userOrganizationId={userOrganizationId}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No organization assigned</p>
        </div>
      )}
      <OrganizationSearch userOrganizationId={userOrganizationId} />
    </div>
  );
};
