
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.username || errors.password) {
      setErrors({
        username: "",
        password: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({
      username: "",
      password: "",
    });

    try {
      const { data, error } = await signIn(formData.username, formData.password);

      if (error) {
        console.error("Login error:", error);
        
        // Show error on both fields for incorrect credentials
        setErrors({
          username: "Incorrect information",
          password: "Incorrect information",
        });
        
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      } else if (data.user) {
        // Check if user is approved
        if (data.isApproved === false) {
          // Redirect to verification pending page
          navigate("/verification-pending", { 
            state: { 
              email: formData.username,
              fromLogin: true 
            } 
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          });
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        username: "Incorrect information",
        password: "Incorrect information",
      });
      
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/ef24d9c6-3b63-47c1-9653-e18341e62604.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-primary/30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-xl opacity-90">
            Sign in to your account to continue your journey with us.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png" 
              alt="Roll Call Logo" 
              className="h-12 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username or email"
                    className={`h-12 ${errors.username ? 'border-destructive' : ''}`}
                    required
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`h-12 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
