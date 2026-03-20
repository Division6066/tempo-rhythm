import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PUSH_DISMISSED_KEY = "tempo-push-dismissed";
const PUSH_DISMISSED_UNTIL_KEY = "tempo-push-dismissed-until";
const PUSH_SUBSCRIBED_KEY = "tempo-push-subscribed";
const PLAN_ACCEPTED_KEY = "tempo-plan-accepted";

function getApiBase(): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}api`.replace(/\/+/g, "/");
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;

    const apiBase = getApiBase();
    const vapidRes = await fetch(`${apiBase}/push/vapid-key`);
    if (!vapidRes.ok) return false;
    const { vapidPublicKey } = await vapidRes.json();
    if (!vapidPublicKey) return false;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const subJson = subscription.toJSON();
    const token = localStorage.getItem("tempo-auth-token") || "";

    const res = await fetch(`${apiBase}/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("[Push] Subscribe failed:", err);
    return false;
  }
}

export default function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (localStorage.getItem(PUSH_SUBSCRIBED_KEY) === "true") return;
    if (!localStorage.getItem(PLAN_ACCEPTED_KEY)) return;

    const dismissedUntil = localStorage.getItem(PUSH_DISMISSED_UNTIL_KEY);
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) return;

    Notification.requestPermission().then(() => {
      if (Notification.permission === "granted") {
        subscribeToPush().then((ok) => {
          if (ok) localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
        });
        return;
      }
      if (Notification.permission !== "denied") {
        setVisible(true);
      }
    });
  }, []);

  const handleEnable = useCallback(async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const ok = await subscribeToPush();
      if (ok) {
        localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
      }
    }
    setVisible(false);
  }, []);

  const handleDismiss = useCallback(() => {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    localStorage.setItem(PUSH_DISMISSED_UNTIL_KEY, threeDaysLater.toISOString());
    localStorage.setItem(PUSH_DISMISSED_KEY, "true");
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">Stay on track</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Get morning briefings, streak reminders, and inbox nudges to keep your momentum going.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleEnable} className="gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                Enable
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function markPlanAccepted() {
  localStorage.setItem(PLAN_ACCEPTED_KEY, "true");
}
