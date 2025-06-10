
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus, Building } from "lucide-react";
import { RegistrationData } from "@/pages/Register";

interface OrganizationChoiceStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
}

export const OrganizationChoiceStep = ({ data, onNext, onBack, onUpdate }: OrganizationChoiceStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Organization Setup</h2>
        <p className="text-muted-foreground mt-2">
          Choose how you'd like to get started
        </p>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              value={data.organizationChoice}
              onValueChange={(value: 'new' | 'existing') => onUpdate({ organizationChoice: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value="new" id="new" />
                <div className="flex items-center space-x-3 flex-1">
                  <Plus className="h-6 w-6 text-primary" />
                  <div>
                    <Label htmlFor="new" className="text-base font-medium cursor-pointer">
                      Create New Organization
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Start fresh with your own organization
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value="existing" id="existing" />
                <div className="flex items-center space-x-3 flex-1">
                  <Building className="h-6 w-6 text-primary" />
                  <div>
                    <Label htmlFor="existing" className="text-base font-medium cursor-pointer">
                      Join Existing Organization
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Request to join an organization that already exists
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" className="flex-1 h-12">
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
