
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Profile = () => {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [contactInfo, setContactInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  });
  const [organizationSearch, setOrganizationSearch] = useState("");

  // Current organization data
  const currentOrganization = {
    name: "Tech Solutions Inc",
    role: "Software Developer",
    joinedDate: "January 15, 2024",
    logo: "/placeholder.svg"
  };

  // Mock organizations for search
  const availableOrganizations = [
    { id: "1", name: "Green Earth Foundation", type: "Environmental" },
    { id: "2", name: "Community Health Center", type: "Healthcare" },
    { id: "3", name: "Education First", type: "Education" },
    { id: "4", name: "Local Food Bank", type: "Community Service" },
  ];

  const filteredOrganizations = availableOrganizations.filter(org =>
    org.name.toLowerCase().includes(organizationSearch.toLowerCase()) ||
    org.type.toLowerCase().includes(organizationSearch.toLowerCase())
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });
    }
  };

  const handleContactSave = () => {
    toast({
      title: "Contact information saved",
      description: "Your contact information has been successfully updated.",
    });
  };

  const handleInputChange = (field: keyof typeof contactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>
                Update your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback>
                  {contactInfo.firstName.charAt(0)}{contactInfo.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <Label htmlFor="profile-upload" asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Date Joined */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Joined</Label>
                <p className="text-sm text-muted-foreground">March 15, 2024</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update your personal contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={contactInfo.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={contactInfo.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <Button onClick={handleContactSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Contact Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          {/* Current Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Current Organization</CardTitle>
              <CardDescription>
                Your current organization affiliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentOrganization.logo} alt="Organization Logo" />
                  <AvatarFallback>
                    {currentOrganization.name.split(' ').map(word => word.charAt(0)).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{currentOrganization.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentOrganization.role}</p>
                  <p className="text-xs text-muted-foreground">Joined: {currentOrganization.joinedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Search Organizations</CardTitle>
              <CardDescription>
                Find and explore other organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={organizationSearch}
                  onChange={(e) => setOrganizationSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.type}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
                {organizationSearch && filteredOrganizations.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No organizations found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
