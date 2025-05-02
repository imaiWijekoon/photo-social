"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react"; // Bell icon
import { Button } from "@/components/ui/button"; // Custom UI button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Dropdown components
import type { Notification } from "@/lib/types"; // Notification type
import { getUsername } from "@/lib/auth"; // Function to get logged-in username
import { ScrollArea } from "@/components/ui/scroll-area"; // Scrollable area
import { Badge } from "./ui/badge"; // Badge component (for unread count)

export default function NotificationDropdown() {
  // State to store the list of notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // State to show loading text while data is being fetched
  const [loading, setLoading] = useState(true);

  // State to check if dropdown is open or not
  const [open, setOpen] = useState(false);

  // This function fetches notifications from the backend
  const fetchNotifications = async () => {
    const username = getUsername(); // Get current user
    if (!username) return; // If no user, exit

    try {
      // Make API call to get user's notifications
      const response = await axios.get(`http://localhost:8080/api/notifications/user/${username}`);
      if (response.data) {
        setNotifications(response.data); // Save fetched notifications
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      // If API call fails, show some default/fake data
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
      setLoading(false); // Hide loading text
    }
  };

  // When the dropdown is opened, fetch the notifications
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // This function marks a notification as read in the backend
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        // Update UI: mark that notification as read
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

  // Count how many notifications are unread
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Button with Bell icon that shows the dropdown when clicked */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Show a red badge if there are unread notifications */}
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

      {/* The actual dropdown content */}
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-medium">Notifications</div>

        {/* Scrollable list of notifications */}
        <ScrollArea className="h-[300px]">
          {/* Show loading message */}
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            // If there are no notifications
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            // List all notifications
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
                onClick={() => markNotificationAsRead(notification.id)} // Mark as read when clicked
              >
                {/* Notification message */}
                <div className="text-sm">{notification.message}</div>

                {/* Date and time of notification */}
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
