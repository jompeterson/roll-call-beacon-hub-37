
import { useState, useEffect } from "react";
import { customAuth, type User as CustomUser } from "@/lib/customAuth";
import { useProfileData } from "@/hooks/useProfileData";

export const useAuth = () => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const isAuthenticated = !!user;
  
  // Always call useProfileData, but it will handle auth check internally
  const { userRole } = useProfileData();

  useEffect(() => {
    // Get initial user
    setUser(customAuth.getUser());

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const isAdministrator = userRole?.name === 'administrator';

  return {
    user,
    isAuthenticated,
    isAdministrator,
    userRole
  };
};
