import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Glasses,
  Tag,
  Eye,
  Megaphone,
  Sparkles,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, NotificationItem } from "@/store/notifications";
import { useAuth } from "@/store/auth";

function getCategoryIcon(category?: string) {
  switch (category) {
    case "NEW_COLLECTION":
      return <Glasses className="h-4 w-4 text-blue-500" />;
    case "PROMOTION":
      return <Tag className="h-4 w-4 text-amber-500" />;
    case "EYE_HEALTH":
      return <Eye className="h-4 w-4 text-emerald-500" />;
    case "STORE_UPDATE":
      return <Megaphone className="h-4 w-4 text-cyan-500" />;
    default:
      return <Sparkles className="h-4 w-4 text-primary" />;
  }
}

function formatRelativeTime(dateString: string) {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recent";
  }
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    const link = item.metadata?.linkUrl;
    if (link) {
      setOpen(false);
      navigate({ to: link });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-transform active:scale-95"
          aria-label={`Notifications (${unreadCount} unread)`}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[420px] p-0 rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-md overflow-hidden z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">Notifications</span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5">
                {unreadCount} new
              </span>
            ) : null}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-6 w-6 opacity-70" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                You'll receive personalized eyewear drops, optical offers, and appointment reminders here.
              </p>
            </div>
          ) : (
            notifications.slice(0, 8).map((item) => {
              const meta = item.metadata || {};
              const isUnread = !item.read;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    isUnread
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/40 opacity-90"
                  }`}
                >
                  {/* Category icon */}
                  <div className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-card border border-border shadow-xs">
                    {getCategoryIcon(meta.category)}
                  </div>

                  {/* Body content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs truncate ${
                          isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    {meta.imageUrl && (
                      <div className="mt-1.5 h-16 w-full rounded-lg overflow-hidden border border-border/60 bg-muted/20">
                        <img
                          src={meta.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {meta.linkUrl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:underline">
                          {meta.ctaText || "View Details"}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      ) : <span />}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Dismiss"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item.id);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <span
                      aria-label="Unread"
                      className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0 ring-2 ring-primary/20"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border bg-muted/20 text-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full text-xs font-semibold text-primary hover:text-primary"
              onClick={() => setOpen(false)}
            >
              <Link to="/account">Open Notification Center in Account →</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
