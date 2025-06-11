
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown } from "lucide-react";
import { OrganizationModal } from "@/components/OrganizationModal";
import { useOrganizations } from "@/hooks/useOrganizations";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "contact" | "type" | null;

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string;
  address: string;
  contact_user_id: string | null;
  contact_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

const SortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: { 
  children: React.ReactNode;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) => {
  const isActive = currentSort === field;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-[#1e3a52] select-none text-white ${className}`}
      style={{ backgroundColor: "#294865" }}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <div className="ml-2">
          {isActive && currentDirection === "asc" && <ChevronUp className="h-4 w-4" />}
          {isActive && currentDirection === "desc" && <ChevronDown className="h-4 w-4" />}
          {!isActive && <div className="h-4 w-4" />}
        </div>
      </div>
    </TableHead>
  );
};

export const Organizations = () => {
  const { organizations, loading, updateOrganizationContact } = useOrganizations();
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

  const sortData = (data: Organization[]): Organization[] => {
    if (!organizationSort || !organizationDirection) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (organizationSort === "contact") {
        aValue = a.contact_user ? `${a.contact_user.first_name} ${a.contact_user.last_name}` : "";
        bValue = b.contact_user ? `${b.contact_user.first_name} ${b.contact_user.last_name}` : "";
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
                  <SortableTableHead
                    field="name"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-2/5"
                  >
                    Organization
                  </SortableTableHead>
                  <SortableTableHead
                    field="contact"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/4"
                  >
                    Contact Person
                  </SortableTableHead>
                  <SortableTableHead
                    field="type"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/4"
                  >
                    Type
                  </SortableTableHead>
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
                      <TableCell className="font-medium w-2/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
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
      />
    </div>
  );
};
