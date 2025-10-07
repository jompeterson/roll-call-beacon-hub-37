
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const LoginHero = () => {
  const [logoUrl, setLogoUrl] = useState("/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png");

  // Fetch logo URL from settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings' as any)
          .select('value')
          .eq('key', 'logo_url')
          .single();

        if (data && (data as any).value) {
          setLogoUrl((data as any).value);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();

    // Listen for settings changes
    const settingsSubscription = supabase
      .channel('app_settings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'app_settings',
          filter: 'key=eq.logo_url'
        }, 
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            setLogoUrl((payload.new as any).value);
          }
        }
      )
      .subscribe();

    return () => {
      settingsSubscription.unsubscribe();
    };
  }, []);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/40 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <img 
          src={logoUrl} 
          alt="Roll Call Logo" 
          className="max-w-md max-h-96 object-contain"
          onError={(e) => {
            // Fallback to default logo if the custom one fails to load
            e.currentTarget.src = "/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png";
          }}
        />
      </div>
      <div className="absolute inset-0 bg-primary/10"></div>
      <div className="relative z-10 flex flex-col justify-end px-12 pb-12 text-primary-foreground">
        <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
        <p className="text-xl opacity-90">
          Sign in to your account to continue your journey with us.
        </p>
      </div>
    </div>
  );
};
