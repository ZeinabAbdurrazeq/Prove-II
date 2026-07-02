import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  BellIcon,
  CheckIcon,
  XIcon,
  CheckCheckIcon,
  Loader2Icon,
  VideoIcon,
} from "lucide-react";
import { notificationApi } from "../api/notifications";
import { invitationApi } from "../api/invitations";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function NotificationBell() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getMyNotifications,
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const recent = notifications.slice(0, 10);

  useEffect(() => {
    const onClick = (e) => {
      if (
        buttonRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 16);
      const left = Math.min(
        Math.max(8, rect.right - width),
        window.innerWidth - width - 8,
      );

      setPanelStyle({
        position: "fixed",
        top: `${rect.bottom + 12}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 70,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
    queryClient.invalidateQueries({ queryKey: ["pendingInvitationsCount"] });
  };

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const respondMutation = useMutation({
    mutationFn: invitationApi.respondToInvitation,
    onSuccess: (_data, variables) => {
      toast.success(
        variables.action === "accepted"
          ? "Invitation accepted!"
          : "Invitation declined.",
      );
      refetchAll();
    },
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Failed to respond"),
  });

  const handleRespond = async (notification, action) => {
    if (!notification.relatedInvitationId) return;
    try {
      await notificationApi.markAsRead(notification._id);
    } catch {
      /* non-fatal */
    }
    respondMutation.mutate({
      invitationId: notification.relatedInvitationId,
      action,
    });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="btn btn-ghost btn-circle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <div className="indicator">
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="badge badge-error badge-xs indicator-item">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {open && panelStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className="rounded-box border border-base-300 bg-base-100 shadow-xl"
              style={panelStyle}
            >
              <div className="flex items-center justify-between gap-3 border-b border-base-300 p-3 rtl:flex-row-reverse">
                <span className="font-semibold">{t("notifications.title")}</span>
                <button
                  className="btn btn-ghost btn-xs gap-1 rtl:flex-row-reverse"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending || unreadCount === 0}
                >
                  <CheckCheckIcon className="size-3.5" />
                  {t("notifications.markAllRead")}
                </button>
              </div>

              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto">
                {recent.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm opacity-60">
                    {t("notifications.none")}
                  </p>
                ) : (
                  recent.map((n) => (
                    <div
                      key={n._id}
                      className={`border-b border-base-200 p-3 last:border-b-0 ${
                        n.status === "unread" ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.status === "unread" && (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{n.message}</p>
                          <p className="mt-1 text-xs opacity-50">
                            {formatDistanceToNow(new Date(n.createdAt), {
                              addSuffix: true,
                            })}
                          </p>

                          {n.type === "session-invitation" &&
                            n.relatedInvitationId &&
                            n.status === "unread" && (
                              <div className="mt-2 flex gap-2 rtl:flex-row-reverse">
                                <button
                                  className="btn btn-success btn-xs gap-1 rtl:flex-row-reverse"
                                  onClick={() => handleRespond(n, "accepted")}
                                  disabled={respondMutation.isPending}
                                >
                                  {respondMutation.isPending ? (
                                    <Loader2Icon className="size-3 animate-spin" />
                                  ) : (
                                    <CheckIcon className="size-3" />
                                  )}
                                  {t("common.accept")}
                                </button>
                                <button
                                  className="btn btn-error btn-xs gap-1 rtl:flex-row-reverse"
                                  onClick={() => handleRespond(n, "declined")}
                                  disabled={respondMutation.isPending}
                                >
                                  <XIcon className="size-3" />
                                  {t("common.decline")}
                                </button>
                              </div>
                            )}
                          {n.type === "session-started" &&
                            n.relatedSessionId && (
                              <Link
                                to={`/session/${
                                  typeof n.relatedSessionId === "object"
                                    ? n.relatedSessionId._id
                                    : n.relatedSessionId
                                }`}
                                className="btn btn-primary btn-xs gap-1 mt-2"
                                onClick={() => {
                                  void notificationApi.markAsRead(n._id);
                                  setOpen(false);
                                }}
                              >
                                <VideoIcon className="size-3" />
                                {t("invitations.join")}
                              </Link>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default NotificationBell;
