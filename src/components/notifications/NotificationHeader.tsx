
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const NotificationHeader = ({ unreadCount, onMarkAllAsRead }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <h3 className="font-semibold">Notifications</h3>
      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          className="h-auto p-1 text-xs"
        >
          <CheckCheck className="h-3 w-3 mr-1" />
          Mark all read
        </Button>
      )}
    </div>
  );
};
