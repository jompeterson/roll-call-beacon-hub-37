
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const AccountInformation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Joined</Label>
          <p className="text-sm text-muted-foreground">March 15, 2024</p>
        </div>
      </CardContent>
    </Card>
  );
};
