
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

interface OrganizationSelectorProps {
  selectedOrganization: Organization | null;
  onOrganizationSelect: (organization: Organization | null) => void;
}

export const OrganizationSelector = ({ selectedOrganization, onOrganizationSelect }: OrganizationSelectorProps) => {
  const { organizations, loading } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (organization: Organization) => {
    onOrganizationSelect(organization);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onOrganizationSelect(null);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Organization (Optional)</Label>
        <div className="text-sm text-muted-foreground">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Organization (Optional)</Label>
      
      {selectedOrganization ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
          <div>
            <p className="font-medium">{selectedOrganization.name}</p>
            <p className="text-sm text-muted-foreground">{selectedOrganization.type}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="pl-10"
            />
          </div>
          
          {isDropdownOpen && searchTerm && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60">
              <CardContent className="p-0">
                <ScrollArea className="max-h-60">
                  {filteredOrganizations.length > 0 ? (
                    <div className="py-2">
                      {filteredOrganizations.map((org) => (
                        <div
                          key={org.id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleSelect(org)}
                        >
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-muted-foreground">{org.type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No organizations found matching your search.
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
