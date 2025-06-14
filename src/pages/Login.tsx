
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero } from "@/components/auth/LoginHero";

export const Login = () => {
  return (
    <div className="min-h-screen flex">
      <LoginHero />
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </div>
  );
};
