
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Settings = () => {
  const { toast } = useToast();
  const { isAdministrator } = useAuth();
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(true);

  // Redirect non-administrators
  if (!isAdministrator) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. Only administrators can view settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'logo_url')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
          toast({
            title: "Error",
            description: "Failed to load current settings.",
            variant: "destructive",
          });
        } else if (data) {
          setLogoUrl(data.value);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setFetchingSettings(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSaveLogo = async () => {
    if (!logoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid logo URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'logo_url',
          value: logoUrl.trim()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error saving logo URL:', error);
        toast({
          title: "Error",
          description: "Failed to save logo URL. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logo URL has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving logo URL:', error);
      toast({
        title: "Error",
        description: "Failed to save logo URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setLogoUrl("/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png");
  };

  if (fetchingSettings) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Website Logo</CardTitle>
          <CardDescription>
            Update the website logo by providing a URL to a hosted image. The logo will be displayed in the header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
          
          {logoUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded p-4 bg-gray-50">
                <img 
                  src={logoUrl} 
                  alt="Logo preview" 
                  className="h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'block';
                  }}
                />
                <div className="text-sm text-gray-500 hidden">
                  Failed to load image. Please check the URL.
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleSaveLogo} disabled={loading}>
              {loading ? "Saving..." : "Save Logo"}
            </Button>
            <Button variant="outline" onClick={resetToDefault}>
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
