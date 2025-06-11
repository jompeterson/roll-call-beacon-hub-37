
import { useState, useEffect } from "react";
import { customAuth, type User as CustomUser } from "@/lib/customAuth";
import { useProfileData } from "@/hooks/useProfileData";

export const useAuth = () => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isAuthenticated = !!user && isInitialized;
  
  // Always call useProfileData, but it will handle auth check internally
  const { userRole } = useProfileData();

  useEffect(() => {
    // Set initial loading state
    setIsInitialized(false);
    
    // Get initial user - this might be null initially if session validation is pending
    const initialUser = customAuth.getUser();
    setUser(initialUser);
    
    // Wait a bit for the session validation to complete, then mark as initialized
    const initTimeout = setTimeout(() => {
      const currentUser = customAuth.getUser();
      setUser(currentUser);
      setIsInitialized(true);
    }, 100);

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      setUser(user);
      setIsInitialized(true);
    });

    return () => {
      clearTimeout(initTimeout);
      unsubscribe();
    };
  }, []);

  const isAdministrator = userRole?.name === 'administrator';

  return {
    user,
    isAuthenticated,
    isAdministrator,
    userRole,
    isInitialized
  };
};
