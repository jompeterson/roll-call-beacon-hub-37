
import { useState, useEffect } from "react";
import { customAuth, type User as CustomUser } from "@/lib/customAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { checkVerificationStatus } from "@/lib/auth";

export const useAuth = () => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
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
      
      // Check approval status if user is logged in
      if (currentUser) {
        checkVerificationStatus(currentUser.email)
          .then(({ isApproved }) => {
            setIsApproved(isApproved);
          })
          .catch(error => {
            console.error("Error checking approval status:", error);
            setIsApproved(false);
          });
      }
    }, 100);

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      setUser(user);
      setIsInitialized(true);
      
      // Check approval status when auth state changes
      if (user) {
        checkVerificationStatus(user.email)
          .then(({ isApproved }) => {
            setIsApproved(isApproved);
          })
          .catch(error => {
            console.error("Error checking approval status:", error);
            setIsApproved(false);
          });
      } else {
        setIsApproved(null);
      }
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
    isInitialized,
    isApproved
  };
};
