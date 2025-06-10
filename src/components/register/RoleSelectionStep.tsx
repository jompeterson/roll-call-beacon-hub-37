
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Users, Crown } from "lucide-react";
import { RegistrationData } from "@/pages/Register";

interface RoleSelectionStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
}

const roles = [
  {
    value: "supporter",
    label: "Supporter",
    description: "Community member providing support and assistance",
    icon: User
  },
  {
    value: "shop_teacher",
    label: "Shop Teacher",
    description: "Educator with specialized knowledge in shop and technical skills",
    icon: Users
  },
  {
    value: "administrator",
    label: "Administrator",
    description: "Full access to manage organization settings and users",
    icon: Crown
  }
];

export const RoleSelectionStep = ({ data, onNext, onBack, onUpdate }: RoleSelectionStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.role) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Select Your Role</h2>
        <p className="text-muted-foreground mt-2">
          Choose the role you'd like to request for your account
        </p>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              value={data.role}
              onValueChange={(value) => onUpdate({ role: value })}
              className="space-y-4"
            >
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <div key={role.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50">
                    <RadioGroupItem value={role.value} id={role.value} />
                    <div className="flex items-center space-x-3 flex-1">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <div>
                        <Label htmlFor={role.value} className="text-base font-medium cursor-pointer">
                          {role.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" disabled={!data.role} className="flex-1 h-12">
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
