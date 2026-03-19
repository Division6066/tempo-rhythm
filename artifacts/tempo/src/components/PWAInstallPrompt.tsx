import { useState, useEffect, useCallback } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SESSION_KEY = "tempo-pwa-install-dismissed";

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    if (isIOS()) {
      setShowIOSBanner(true);
      requestAnimationFrame(() => setAnimateIn(true));
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
      requestAnimationFrame(() => setAnimateIn(true));
    };

    const installedHandler = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      sessionStorage.setItem(SESSION_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const dismiss = useCallback(() => {
    setAnimateIn(false);
    setTimeout(() => {
      setShowBanner(false);
      setShowIOSBanner(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 300);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, [deferredPrompt]);

  if (!showBanner && !showIOSBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "0 16px 16px",
        transform: animateIn ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease-out",
        pointerEvents: animateIn ? "auto" : "none",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
          maxWidth: 480,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {showIOSBanner ? (
            <Share size={22} color="#E0E0FF" />
          ) : (
            <Download size={22} color="#E0E0FF" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "20px",
            }}
          >
            Add TEMPO to your home screen
          </div>
          <div
            style={{
              color: "rgba(224,224,255,0.7)",
              fontSize: 12,
              lineHeight: "16px",
              marginTop: 2,
            }}
          >
            {showIOSBanner
              ? "Tap Share → Add to Home Screen"
              : "Install for quick access and offline use"}
          </div>
        </div>

        {!showIOSBanner && (
          <button
            onClick={handleInstall}
            style={{
              background: "#6C63FF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Install
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          style={{
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} color="rgba(224,224,255,0.5)" />
        </button>
      </div>
    </div>
  );
}
