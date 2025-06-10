
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Organization {
  name: string;
  role: string;
  joinedDate: string;
  logo: string;
}

interface CurrentOrganizationProps {
  organization: Organization;
}

export const CurrentOrganization = ({ organization }: CurrentOrganizationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Organization</CardTitle>
        <CardDescription>
          Your current organization affiliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.logo} alt="Organization Logo" />
            <AvatarFallback>
              {organization.name.split(' ').map(word => word.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{organization.name}</h3>
            <p className="text-sm text-muted-foreground">{organization.role}</p>
            <p className="text-xs text-muted-foreground">Joined: {organization.joinedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
