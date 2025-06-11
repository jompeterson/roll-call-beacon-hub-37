
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Building2, GraduationCap, FileText, Calendar, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { EventCreateModal } from "@/components/EventCreateModal";
import { ScholarshipCreateModal } from "@/components/ScholarshipCreateModal";
import { DonationCreateModal } from "@/components/donations/DonationCreateModal";
import { RequestCreateModal } from "@/components/donations/RequestCreateModal";

export const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { isAuthenticated, isAdministrator } = useAuth();

  // Don't render the FAB if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const allActions = [
    { name: "New User", icon: User, color: "bg-blue-500 hover:bg-blue-600", adminOnly: true },
    { name: "New Organization", icon: Building2, color: "bg-green-500 hover:bg-green-600", adminOnly: true },
    { name: "New Scholarship", icon: GraduationCap, color: "bg-purple-500 hover:bg-purple-600", adminOnly: false },
    { name: "New Request", icon: FileText, color: "bg-orange-500 hover:bg-orange-600", adminOnly: false },
    { name: "New Donation", icon: Heart, color: "bg-pink-500 hover:bg-pink-600", adminOnly: false },
    { name: "New Event", icon: Calendar, color: "bg-red-500 hover:bg-red-600", adminOnly: false },
  ];

  // Filter actions based on user role
  const actions = allActions.filter(action => !action.adminOnly || isAdministrator);

  const handleActionClick = (actionName: string) => {
    console.log(`Creating ${actionName}`);
    
    if (actionName === "New Event") {
      setEventModalOpen(true);
      setIsExpanded(false);
    } else if (actionName === "New Scholarship") {
      setScholarshipModalOpen(true);
      setIsExpanded(false);
    } else if (actionName === "New Donation") {
      setDonationModalOpen(true);
      setIsExpanded(false);
    } else if (actionName === "New Request") {
      setRequestModalOpen(true);
      setIsExpanded(false);
    } else {
      console.log(`Creating ${actionName}`);
    }
  };

  const handleEventCreated = () => {
    // Optionally refresh events list or show success message
    console.log("Event created successfully");
  };

  const handleScholarshipCreated = () => {
    // Optionally refresh scholarships list or show success message
    console.log("Scholarship created successfully");
  };

  const handleDonationCreated = () => {
    // Optionally refresh donations list or show success message
    console.log("Donation created successfully");
  };

  const handleRequestCreated = () => {
    // Optionally refresh requests list or show success message
    console.log("Request created successfully");
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Buttons */}
        {isExpanded && (
          <div className="flex flex-col space-y-3 mb-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.name}
                  className="flex items-center justify-end space-x-3 animate-in slide-in-from-bottom-2 fade-in-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="bg-card border border-border px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                    {action.name}
                  </span>
                  <Button
                    size="lg"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg text-white",
                      action.color
                    )}
                    onClick={() => handleActionClick(action.name)}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main FAB */}
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg text-white transition-all duration-300 ease-in-out",
            isExpanded && "rotate-45"
          )}
          style={{ backgroundColor: "#294865" }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Plus className="h-6 w-6 transition-transform duration-300 ease-in-out" />
        </Button>
      </div>

      {/* Event Creation Modal */}
      <EventCreateModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onEventCreated={handleEventCreated}
      />

      {/* Scholarship Creation Modal */}
      <ScholarshipCreateModal
        open={scholarshipModalOpen}
        onOpenChange={setScholarshipModalOpen}
        onScholarshipCreated={handleScholarshipCreated}
      />

      {/* Donation Creation Modal */}
      <DonationCreateModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        onDonationCreated={handleDonationCreated}
      />

      {/* Request Creation Modal */}
      <RequestCreateModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onRequestCreated={handleRequestCreated}
      />
    </>
  );
};
