
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { OrganizationModal } from "@/components/OrganizationModal";
import { OrganizationSortableTableHead } from "@/components/organizations/OrganizationSortableTableHead";
import { OrganizationStatusIcon } from "@/components/organizations/OrganizationStatusIcon";
import { useOrganizations } from "@/hooks/useOrganizations";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "contact" | "type" | "status" | null;

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

export const Organizations = () => {
  const { organizations, loading, updateOrganizationContact, approveOrganization, rejectOrganization } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sorting states
  const [organizationSort, setOrganizationSort] = useState<SortField>(null);
  const [organizationDirection, setOrganizationDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);

  const handleOrganizationSort = (field: SortField) => {
    if (organizationSort === field) {
      if (organizationDirection === "asc") {
        setOrganizationDirection("desc");
      } else if (organizationDirection === "desc") {
        setOrganizationSort(null);
        setOrganizationDirection(null);
      } else {
        setOrganizationDirection("asc");
      }
    } else {
      setOrganizationSort(field);
      setOrganizationDirection("asc");
    }
  };

  const getStatusText = (isApproved: boolean, decisionMade: boolean) => {
    if (!decisionMade) {
      return "Pending";
    }
    return isApproved ? "Approved" : "Rejected";
  };

  const getStatusVariant = (isApproved: boolean, decisionMade: boolean) => {
    if (!decisionMade) {
      return "secondary";
    }
    return isApproved ? "default" : "destructive";
  };

  const sortData = (data: Organization[]): Organization[] => {
    if (!organizationSort || !organizationDirection) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (organizationSort === "contact") {
        aValue = a.contact_user ? `${a.contact_user.first_name} ${a.contact_user.last_name}` : "";
        bValue = b.contact_user ? `${b.contact_user.first_name} ${b.contact_user.last_name}` : "";
      } else if (organizationSort === "status") {
        aValue = getStatusText(a.is_approved, a.approval_decision_made);
        bValue = getStatusText(b.is_approved, b.approval_decision_made);
      } else {
        aValue = a[organizationSort as keyof Organization] as string || "";
        bValue = b[organizationSort as keyof Organization] as string || "";
      }
      
      if (organizationDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const filterData = (data: Organization[]): Organization[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.contact_user && 
          (`${item.contact_user.first_name} ${item.contact_user.last_name}`)
            .toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return matchesSearch;
    });
  };

  const filteredOrganizations = filterData(organizations);
  const sortedOrganizations = sortData(filteredOrganizations);

  const handleOrganizationRowClick = (organization: Organization) => {
    setSelectedOrganization(organization);
    setOrganizationModalOpen(true);
  };

  const handleOrganizationApprove = async (id: string) => {
    const success = await approveOrganization(id);
    if (success) {
      setOrganizationModalOpen(false);
    }
  };

  const handleOrganizationReject = async (id: string) => {
    const success = await rejectOrganization(id);
    if (success) {
      setOrganizationModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Loading organizations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground">
          Manage partner organizations and relationships
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="space-y-4">
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <OrganizationSortableTableHead
                    field="name"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/3"
                  >
                    Organization
                  </OrganizationSortableTableHead>
                  <OrganizationSortableTableHead
                    field="contact"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/4"
                  >
                    Contact Person
                  </OrganizationSortableTableHead>
                  <OrganizationSortableTableHead
                    field="type"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/4"
                  >
                    Type
                  </OrganizationSortableTableHead>
                  <OrganizationSortableTableHead
                    field="status"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/6"
                  >
                    Status
                  </OrganizationSortableTableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="flex-1">
              <Table>
                <TableBody>
                  {sortedOrganizations.map((org) => (
                    <TableRow 
                      key={org.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOrganizationRowClick(org)}
                    >
                      <TableCell className="font-medium w-1/3 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                        {org.name}
                      </TableCell>
                      <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                        {org.contact_user 
                          ? `${org.contact_user.first_name} ${org.contact_user.last_name}`
                          : ""
                        }
                      </TableCell>
                      <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                        {org.type}
                      </TableCell>
                      <TableCell className="w-1/6">
                        <div className="flex items-center gap-2">
                          <OrganizationStatusIcon 
                            isApproved={org.is_approved} 
                            decisionMade={org.approval_decision_made} 
                          />
                          <Badge variant={getStatusVariant(org.is_approved, org.approval_decision_made)}>
                            {getStatusText(org.is_approved, org.approval_decision_made)}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Modal */}
      <OrganizationModal
        organization={selectedOrganization}
        open={organizationModalOpen}
        onOpenChange={setOrganizationModalOpen}
        onUpdateContact={updateOrganizationContact}
        onApprove={handleOrganizationApprove}
        onReject={handleOrganizationReject}
      />
    </div>
  );
};
