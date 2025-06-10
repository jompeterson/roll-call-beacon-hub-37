
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/hooks/useOrganizations";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string;
  address: string;
}

interface OrganizationSearchProps {
  userOrganizationId?: string | null;
}

export const OrganizationSearch = ({ userOrganizationId }: OrganizationSearchProps) => {
  const { toast } = useToast();
  const { organizations, loading } = useOrganizations();
  const [organizationSearch, setOrganizationSearch] = useState("");

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(organizationSearch.toLowerCase()) ||
    org.type.toLowerCase().includes(organizationSearch.toLowerCase())
  );

  const handleRequestAccess = (organizationName: string) => {
    toast({
      title: "Access request sent",
      description: `Your request to join ${organizationName} has been sent.`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Organizations</CardTitle>
          <CardDescription>Loading organizations...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Organizations</CardTitle>
        <CardDescription>
          Find and explore other organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={organizationSearch}
            onChange={(e) => setOrganizationSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredOrganizations.map((org) => {
            const isUserInOrganization = userOrganizationId === org.id;
            
            return (
              <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-muted-foreground">{org.type}</p>
                  {isUserInOrganization && (
                    <p className="text-xs text-primary font-medium">Current Organization</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{org.name}</DialogTitle>
                        <DialogDescription>
                          Organization details and contact information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Type</Label>
                          <p className="text-sm text-muted-foreground">{org.type}</p>
                        </div>
                        
                        {org.description && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-muted-foreground">{org.description}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Contact Information</Label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{org.phone}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{org.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {!isUserInOrganization && (
                    <Button 
                      size="sm"
                      onClick={() => handleRequestAccess(org.name)}
                    >
                      Request Access
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {organizationSearch && filteredOrganizations.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No organizations found matching your search.
            </div>
          )}
          {!organizationSearch && filteredOrganizations.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No organizations available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
