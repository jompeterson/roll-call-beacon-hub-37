
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Building, Loader2 } from "lucide-react";
import { RegistrationData } from "@/pages/Register";
import { getExistingOrganizations } from "@/lib/auth";

interface ExistingOrganizationStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

export const ExistingOrganizationStep = ({ data, onNext, onBack, onUpdate }: ExistingOrganizationStepProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data: orgs, error } = await getExistingOrganizations();
        if (error) {
          setError('Failed to load organizations');
          console.error('Error fetching organizations:', error);
        } else {
          setOrganizations(orgs || []);
        }
      } catch (err) {
        setError('Failed to load organizations');
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.existingOrganizationId) {
      onNext();
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Loading Organizations</h2>
          <p className="text-muted-foreground mt-2">
            Please wait while we fetch available organizations
          </p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading organizations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Error Loading Organizations</h2>
          <p className="text-muted-foreground mt-2">
            There was an issue loading the available organizations
          </p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Select Organization</h2>
        <p className="text-muted-foreground mt-2">
          Choose an existing organization to join
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {organizations.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Organizations Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are no existing organizations to join at this time.
                </p>
                <Button onClick={onBack} variant="outline">
                  Create New Organization Instead
                </Button>
              </div>
            ) : (
              <RadioGroup
                value={data.existingOrganizationId}
                onValueChange={(value) => onUpdate({ existingOrganizationId: value })}
                className="space-y-4"
              >
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50">
                    <RadioGroupItem value={org.id} id={org.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={org.id} className="text-base font-medium cursor-pointer">
                        {org.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{org.type}</p>
                      {org.description && (
                        <p className="text-sm text-muted-foreground mt-1">{org.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {organizations.length > 0 && (
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={!data.existingOrganizationId} className="flex-1 h-12">
                  Continue
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
