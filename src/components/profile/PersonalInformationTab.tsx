
import { ProfileImageSection } from "./ProfileImageSection";
import { AccountInformation } from "./AccountInformation";
import { ContactInformation } from "./ContactInformation";

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PersonalInformationTabProps {
  contactInfo: ContactInfo;
  joinedDate: string;
  onContactInfoChange: (info: ContactInfo) => Promise<void> | void;
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
