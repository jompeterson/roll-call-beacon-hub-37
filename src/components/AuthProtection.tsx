
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { customAuth } from "@/lib/customAuth";
import { useToast } from "@/components/ui/use-toast";
import { checkVerificationStatus } from "@/lib/auth";

export const AuthProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkUserApprovalStatus = async () => {
      setIsChecking(true);
      
      // Get current user
      const user = customAuth.getUser();
      
      // Skip check for verification page and login/register pages
      const publicPaths = ["/verification-pending", "/login", "/register"];
      if (publicPaths.includes(location.pathname) || !user) {
        setIsChecking(false);
        return;
      }
      
      try {
        // Check if the user is approved
        const { isApproved, error } = await checkVerificationStatus(user.email);
        
        if (error) {
          console.error("Error checking verification status:", error);
          // On error, we sign out to be safe
          await customAuth.signOut();
          toast({
            title: "Session Error",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        if (!isApproved) {
          // Sign out and redirect to verification pending page
          await customAuth.signOut();
          toast({
            title: "Account Not Approved",
            description: "Your account is still pending approval. You've been signed out.",
            variant: "destructive",
          });
          navigate("/verification-pending", { 
            state: { 
              email: user.email,
              fromLogin: true
            } 
          });
        }
      } catch (error) {
        console.error("Error in auth protection:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserApprovalStatus();
  }, [location.pathname, navigate, toast]);
  
  // Don't render anything, this is just for the side effect
  return null;
};
