
import React from "react";
import { useNavigate } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleNotificationClick = async () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Close the dropdown
    const dropdownTrigger = document.querySelector('[data-state="open"]');
    if (dropdownTrigger) {
      (dropdownTrigger as HTMLElement).click();
    }

    // For comment notifications, we need to find the parent content
    if (notification.related_content_type === 'comment' && notification.related_content_id) {
      try {
        // Fetch the comment to get the content_type and content_id
        const { data: comment, error } = await supabase
          .from('comments')
          .select('content_type, content_id')
          .eq('id', notification.related_content_id)
          .single();

        if (error) {
          console.error('Error fetching comment:', error);
          navigate('/');
          return;
        }

        if (comment) {
          // Navigate based on the parent content type
          switch (comment.content_type) {
            case 'donation':
              navigate(`/donations/${comment.content_id}`);
              break;
              
            case 'request':
              navigate(`/donations/requests/${comment.content_id}`);
              break;
              
            case 'scholarship':
              navigate(`/scholarships/${comment.content_id}`);
              break;
              
            case 'event':
              navigate(`/events/${comment.content_id}`);
              break;
              
            default:
              navigate('/');
          }
          return;
        }
      } catch (error) {
        console.error('Error handling comment notification:', error);
        navigate('/');
        return;
      }
    }

    // Navigate to the appropriate page with the content ID for direct modal opening
    if (notification.related_content_type && notification.related_content_id) {
      switch (notification.related_content_type) {
        case 'donation':
          navigate(`/donations/${notification.related_content_id}`);
          break;
          
        case 'request':
          navigate(`/donations/requests/${notification.related_content_id}`);
          break;
          
        case 'scholarship':
          navigate(`/scholarships/${notification.related_content_id}`);
          break;
          
        case 'event':
          navigate(`/events/${notification.related_content_id}`);
          break;
          
        case 'user':
          // For user registration notifications, navigate to the Users page
          navigate('/users');
          break;
          
        default:
          // Default to dashboard if we can't determine the content type
          navigate('/');
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
      case 'user_registration':
        return '👤';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenuItem
      className={`flex items-start space-x-3 p-3 cursor-pointer ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
      }`}
      onClick={handleNotificationClick}
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
  );
};
