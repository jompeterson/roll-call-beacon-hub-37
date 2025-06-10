
import { ProfileImageSection } from "./ProfileImageSection";
import { AccountInformation } from "./AccountInformation";
import { ContactInformation } from "./ContactInformation";

interface PersonalInformationTabProps {
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  joinedDate: string;
  onContactInfoChange: (info: typeof contactInfo) => Promise<void> | void;
}

export const PersonalInformationTab = ({ 
  contactInfo, 
  joinedDate, 
  onContactInfoChange 
}: PersonalInformationTabProps) => {
  return (
    <div className="space-y-6">
      <ProfileImageSection contactInfo={contactInfo} />
      <AccountInformation joinedDate={joinedDate} />
      <ContactInformation 
        contactInfo={contactInfo} 
        onContactInfoChange={onContactInfoChange} 
      />
    </div>
  );
};
