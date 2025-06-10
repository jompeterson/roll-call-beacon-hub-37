
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Users, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  type: string;
  userCount: number;
  owner: string;
  email: string;
  phone: string;
  description: string;
}

interface OrganizationSearchProps {
  organizations: Organization[];
}

export const OrganizationSearch = ({ organizations }: OrganizationSearchProps) => {
  const { toast } = useToast();
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
          {filteredOrganizations.map((org) => (
            <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-muted-foreground">{org.type}</p>
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
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground">{org.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Members
                          </Label>
                          <p className="text-sm">{org.userCount} users</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Owner</Label>
                          <p className="text-sm">{org.owner}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Contact Information</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{org.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{org.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm"
                  onClick={() => handleRequestAccess(org.name)}
                >
                  Request Access
                </Button>
              </div>
            </div>
          ))}
          {organizationSearch && filteredOrganizations.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No organizations found matching your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
