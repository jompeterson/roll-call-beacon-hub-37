
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { RegistrationData } from "@/pages/Register";
import { supabase } from "@/integrations/supabase/client";

interface EmailPasswordStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
}

export const EmailPasswordStep = ({ data, onNext, onBack, onUpdate }: EmailPasswordStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [logoUrl, setLogoUrl] = useState("/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png");

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'logo_url')
        .single();
      
      if (data?.value) {
        setLogoUrl(data.value);
      }
    };

    fetchLogo();

    const channel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
          filter: 'key=eq.logo_url'
        },
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            setLogoUrl(payload.new.value as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (data.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <img 
            src={logoUrl}
            alt="Logo" 
            className="h-12 object-contain"
            onError={(e) => {
              e.currentTarget.src = "/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png";
            }}
          />
          <img 
            src="/lovable-uploads/3bf5b36b-46ad-420d-8eb5-7435b9aaad17.png" 
            alt="Header Icon" 
            className="h-12 object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
        <p className="text-muted-foreground mt-2">
          Enter your email and create a secure password
        </p>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="Enter your email address"
                className="h-12"
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => onUpdate({ password: e.target.value })}
                  placeholder="Create a password"
                  className="h-12 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="h-12 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
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
