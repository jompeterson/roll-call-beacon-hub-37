
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmailPasswordStep } from "@/components/register/EmailPasswordStep";
import { RoleSelectionStep } from "@/components/register/RoleSelectionStep";
import { PersonalInfoStep } from "@/components/register/PersonalInfoStep";
import { OrganizationChoiceStep } from "@/components/register/OrganizationChoiceStep";
import { NewOrganizationStep } from "@/components/register/NewOrganizationStep";
import { VerificationPendingStep } from "@/components/register/VerificationPendingStep";

export interface RegistrationData {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  organizationChoice: 'new' | 'existing';
  existingOrganizationId?: string;
  newOrganization?: {
    name: string;
    type: string;
    description: string;
    address: string;
    phone: string;
  };
}

export const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: "",
    password: "",
    role: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    organizationChoice: 'new'
  });

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const getTotalSteps = () => {
    return registrationData.organizationChoice === 'new' ? 6 : 5;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EmailPasswordStep
            data={registrationData}
            onNext={nextStep}
            onUpdate={updateRegistrationData}
            onBack={() => navigate("/login")}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            data={registrationData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={updateRegistrationData}
          />
        );
      case 3:
        return (
          <PersonalInfoStep
            data={registrationData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={updateRegistrationData}
          />
        );
      case 4:
        return (
          <OrganizationChoiceStep
            data={registrationData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={updateRegistrationData}
          />
        );
      case 5:
        if (registrationData.organizationChoice === 'new') {
          return (
            <NewOrganizationStep
              data={registrationData}
              onNext={nextStep}
              onBack={prevStep}
              onUpdate={updateRegistrationData}
            />
          );
        } else {
          return (
            <VerificationPendingStep
              data={registrationData}
              onRefresh={() => console.log("Checking verification status...")}
            />
          );
        }
      case 6:
        return (
          <VerificationPendingStep
            data={registrationData}
            onRefresh={() => console.log("Checking verification status...")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/d16ba253-a4ac-4e57-b7c4-2f3c64d3cae3.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-primary/30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">Join Our Community</h1>
          <p className="text-xl opacity-90">
            Create your account and become part of our growing network.
          </p>
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-1 bg-primary-foreground rounded"></div>
              <span className="text-sm">Step {currentStep} of {getTotalSteps()}</span>
            </div>
            <div className="w-full bg-primary-foreground/20 rounded-full h-2">
              <div 
                className="bg-primary-foreground h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
