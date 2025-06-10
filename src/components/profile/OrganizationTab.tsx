
import { CurrentOrganization } from "./CurrentOrganization";
import { OrganizationSearch } from "./OrganizationSearch";
import { availableOrganizations } from "@/data/organizations";

interface OrganizationData {
  name: string;
  role: string;
  joinedDate: string;
  logo: string;
}

interface OrganizationTabProps {
  organizationData: OrganizationData | null;
}

export const OrganizationTab = ({ organizationData }: OrganizationTabProps) => {
  return (
    <div className="space-y-6">
      {organizationData ? (
        <CurrentOrganization organization={organizationData} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No organization assigned</p>
        </div>
      )}
      <OrganizationSearch organizations={availableOrganizations} />
    </div>
  );
};
