
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Building2, Check } from "lucide-react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrganizationSelectorProps {
  selectedOrganizationId: string;
  onOrganizationSelect: (organizationId: string) => void;
}

export const OrganizationSelector = ({ selectedOrganizationId, onOrganizationSelect }: OrganizationSelectorProps) => {
  const { organizations, loading } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOrganization = organizations.find(org => org.id === selectedOrganizationId);

  const handleOrganizationSelect = (organizationId: string) => {
    onOrganizationSelect(organizationId);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    onOrganizationSelect("");
  };

  return (
    <div className="space-y-2">
      {selectedOrganization ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{selectedOrganization.name}</p>
              <p className="text-sm text-muted-foreground">{selectedOrganization.type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Select Organization</DialogTitle>
                  <DialogDescription>
                    Choose an organization for this user
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Loading organizations...
                        </div>
                      ) : filteredOrganizations.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No organizations found
                        </div>
                      ) : (
                        filteredOrganizations.map((org) => (
                          <div
                            key={org.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleOrganizationSelect(org.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{org.name}</p>
                                <p className="text-sm text-muted-foreground">{org.type}</p>
                              </div>
                            </div>
                            {selectedOrganizationId === org.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="h-4 w-4 mr-2" />
              Select Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Select Organization</DialogTitle>
              <DialogDescription>
                Choose an organization for this user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading organizations...
                    </div>
                  ) : filteredOrganizations.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No organizations found
                    </div>
                  ) : (
                    filteredOrganizations.map((org) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleOrganizationSelect(org.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">{org.type}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
