import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { DonationModal } from "@/components/DonationModal";
import { ScholarshipModal } from "@/components/ScholarshipModal";
import { EventModal } from "@/components/EventModal";
import type { Donation } from "@/hooks/useDonations";

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const handleNotificationClick = async (notificationId: string, isRead: boolean, notification: any) => {
    if (!isRead) {
      markAsRead(notificationId);
    }

    // Close the dropdown
    const dropdownTrigger = document.querySelector('[data-state="open"]');
    if (dropdownTrigger) {
      (dropdownTrigger as HTMLElement).click();
    }

    // Navigate to the appropriate page and open modal based on the content type
    if (notification.related_content_type && notification.related_content_id) {
      try {
        switch (notification.related_content_type) {
          case 'donation':
            navigate('/donations');
            // Fetch and open donation modal
            const { data: donationData, error: donationError } = await supabase
              .from('donations')
              .select('*')
              .eq('id', notification.related_content_id)
              .single();
            
            if (!donationError && donationData) {
              setSelectedDonation(donationData as Donation);
              setDonationModalOpen(true);
            }
            break;
            
          case 'request':
            navigate('/donations'); // Requests are shown on the donations page
            // For requests, we could add a request modal in the future
            break;
            
          case 'scholarship':
            navigate('/scholarships');
            // Fetch and open scholarship modal
            const { data: scholarshipData, error: scholarshipError } = await supabase
              .from('scholarships')
              .select(`
                *,
                creator:user_profiles!creator_user_id(email),
                organization:organizations(id, name, type)
              `)
              .eq('id', notification.related_content_id)
              .single();
            
            if (!scholarshipError && scholarshipData) {
              setSelectedScholarship(scholarshipData);
              setScholarshipModalOpen(true);
            }
            break;
            
          case 'event':
            navigate('/events');
            // Fetch and open event modal
            const { data: eventData, error: eventError } = await supabase
              .from('events')
              .select('*')
              .eq('id', notification.related_content_id)
              .single();
            
            if (!eventError && eventData) {
              setSelectedEvent(eventData);
              setEventModalOpen(true);
            }
            break;
            
          case 'comment':
            // For comments, we need to navigate to the parent content
            if (notification.type === 'comment_reply' || notification.type === 'post_comment') {
              // For now, we'll navigate to the donations page as it's the most common
              // In a real implementation, you might want to store the parent content type
              navigate('/donations');
            }
            break;
            
          default:
            // Default to dashboard if we can't determine the content type
            navigate('/');
        }
      } catch (error) {
        console.error('Error fetching content for notification:', error);
        // Fallback to just navigation
        switch (notification.related_content_type) {
          case 'donation':
          case 'request':
            navigate('/donations');
            break;
          case 'scholarship':
            navigate('/scholarships');
            break;
          case 'event':
            navigate('/events');
            break;
          default:
            navigate('/');
        }
      }
    } else {
      // If no specific content, just go to dashboard
      navigate('/');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_reply':
        return '💬';
      case 'post_comment':
        return '📝';
      case 'new_post':
        return '📢';
      default:
        return '🔔';
    }
  };

  // Modal action handlers (placeholder implementations)
  const handleDonationApprove = (id: string) => {
    console.log("Approved donation:", id);
    setDonationModalOpen(false);
  };

  const handleDonationReject = (id: string) => {
    console.log("Rejected donation:", id);
    setDonationModalOpen(false);
  };

  const handleDonationRequestChanges = (id: string) => {
    console.log("Requested changes for donation:", id);
    setDonationModalOpen(false);
  };

  const handleScholarshipApprove = (id: string) => {
    console.log("Approved scholarship:", id);
    setScholarshipModalOpen(false);
  };

  const handleScholarshipReject = (id: string) => {
    console.log("Rejected scholarship:", id);
    setScholarshipModalOpen(false);
  };

  const handleScholarshipRequestChanges = (id: string) => {
    console.log("Requested changes for scholarship:", id);
    setScholarshipModalOpen(false);
  };

  const handleEventApprove = (id: string) => {
    console.log("Approved event:", id);
    setEventModalOpen(false);
  };

  const handleEventReject = (id: string) => {
    console.log("Rejected event:", id);
    setEventModalOpen(false);
  };

  const handleEventRequestChanges = (id: string) => {
    console.log("Requested changes for event:", id);
    setEventModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-popover border">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.is_read, notification)}
                >
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
          
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all notifications
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <DonationModal
        donation={selectedDonation}
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        onApprove={handleDonationApprove}
        onReject={handleDonationReject}
        onRequestChanges={handleDonationRequestChanges}
      />

      <ScholarshipModal
        scholarship={selectedScholarship}
        open={scholarshipModalOpen}
        onOpenChange={setScholarshipModalOpen}
        onApprove={handleScholarshipApprove}
        onReject={handleScholarshipReject}
        onRequestChanges={handleScholarshipRequestChanges}
      />

      <EventModal
        event={selectedEvent}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        onRequestChanges={handleEventRequestChanges}
      />
    </>
  );
};
