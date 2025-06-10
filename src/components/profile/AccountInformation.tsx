
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface AccountInformationProps {
  joinedDate: string;
}

export const AccountInformation = ({ joinedDate }: AccountInformationProps) => {
  const formattedDate = new Date(joinedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Joined</Label>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </CardContent>
    </Card>
  );
};
