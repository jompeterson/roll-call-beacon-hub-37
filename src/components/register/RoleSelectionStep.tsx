
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Users, Crown, Loader2 } from "lucide-react";
import { RegistrationData } from "@/pages/Register";
import { getUserRoles } from "@/lib/auth";

interface RoleSelectionStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
}

const roleIcons: { [key: string]: any } = {
  supporter: User,
  shop_teacher: Users,
  administrator: Crown,
};

export const RoleSelectionStep = ({ data, onNext, onBack, onUpdate }: RoleSelectionStepProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data: rolesData, error } = await getUserRoles();
        if (error) {
          setError('Failed to load roles');
          console.error('Error fetching roles:', error);
        } else {
          setRoles(rolesData || []);
        }
      } catch (err) {
        setError('Failed to load roles');
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.role) {
      onNext();
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Loading Roles</h2>
          <p className="text-muted-foreground mt-2">
            Please wait while we fetch available roles
          </p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading roles...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Error Loading Roles</h2>
          <p className="text-muted-foreground mt-2">
            There was an issue loading the available roles
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
                const IconComponent = roleIcons[role.name] || User;
                return (
                  <div key={role.id} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50">
                    <RadioGroupItem value={role.name} id={role.id} />
                    <div className="flex items-center space-x-3 flex-1">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <div>
                        <Label htmlFor={role.id} className="text-base font-medium cursor-pointer">
                          {role.display_name}
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
