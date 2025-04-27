"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notification } from "@/lib/types";
import { getUsername } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "./ui/badge";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Simulated API call to fetch notifications
  const fetchNotifications = async () => {
    const username = getUsername();
    if (!username) return;

    try {
      const response = await axios.get(`http://localhost:8080/api/notifications/user/${username}`);
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      // Fallback data
      setNotifications([
        {
          id: "1",
          recipient: username,
          message: "John liked your post",
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          recipient: username,
          message: "Sarah commented on your post",
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when the dropdown is opened
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };



  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-medium">Notifications</div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="text-sm">{notification.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}