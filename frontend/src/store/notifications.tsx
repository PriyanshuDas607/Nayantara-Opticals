import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/store/auth";

export interface NotificationItem {
  id: string;
  userId: string;
  channel: string;
  title: string;
  body: string;
  read: boolean;
  status: string;
  createdAt: string;
  metadata?: {
    category?: "NEW_COLLECTION" | "PROMOTION" | "EYE_HEALTH" | "STORE_UPDATE" | "ANNOUNCEMENT";
    priority?: "NORMAL" | "HIGH" | "URGENT";
    linkUrl?: string;
    ctaText?: string;
    imageUrl?: string;
    templateId?: string;
    campaignTitle?: string;
    read?: boolean;
    readAt?: string;
    sentBy?: {
      userId: string;
      role: string;
      name?: string;
    };
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<NotificationItem[]>("/notifications");
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        const unread = res.data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    // Poll every 45 seconds for new notifications
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, metadata: { ...n.metadata, read: true } } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, metadata: { ...n.metadata, read: true } }))
    );
    setUnreadCount(0);

    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
    } catch {
      // ignore
    }
  };

  const deleteNotification = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
