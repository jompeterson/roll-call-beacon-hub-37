
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

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notificationId: string, isRead: boolean, notification: any) => {
    if (!isRead) {
      markAsRead(notificationId);
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
  );
};
