"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface BrutalNotificationContextType {
  notify: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const BrutalNotificationContext = createContext<BrutalNotificationContextType | undefined>(undefined);

export function useBrutalNotification() {
  const context = useContext(BrutalNotificationContext);
  if (!context) {
    throw new Error("useBrutalNotification must be used within a BrutalNotificationProvider");
  }
  return context;
}

export function BrutalNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const notify = {
    success: (message: string) => addNotification(message, "success"),
    error: (message: string) => addNotification(message, "error"),
    info: (message: string) => addNotification(message, "info"),
  };

  return (
    <BrutalNotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-3 pointer-events-none items-stretch sm:items-end">
        <AnimatePresence>
          {notifications.map((n) => (
            <GlassToast key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
          ))}
        </AnimatePresence>
      </div>
    </BrutalNotificationContext.Provider>
  );
}

function GlassToast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const flavor = {
    success: {
      accent: "rgba(52,211,153,0.9)",
      ring: "0 0 0 1px rgba(52,211,153,0.35), 0 0 24px rgba(52,211,153,0.18)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    error: {
      accent: "rgba(244,114,182,0.9)",
      ring: "0 0 0 1px rgba(244,114,182,0.35), 0 0 24px rgba(244,114,182,0.18)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v5M12 17v.01M12 3l10 18H2L12 3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    info: {
      accent: "rgba(255,255,255,0.85)",
      ring: "0 0 0 1px rgba(255,255,255,0.18), 0 0 24px rgba(255,255,255,0.06)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v.01M12 11v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  }[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      layout
      role="alert"
      style={{ boxShadow: flavor.ring }}
      className="pointer-events-auto w-full sm:min-w-[320px] sm:max-w-[400px] glass-strong glass-shadow rounded-2xl px-4 py-3 flex items-start gap-3"
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)", color: flavor.accent }}
      >
        {flavor.icon}
      </div>
      <div className="flex-1 pt-1.5 text-sm leading-snug text-white/90">
        {notification.message}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="flex-shrink-0 w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.div>
  );
}
