"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Bug, Home, LogOut, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PaywallModal from "@/components/payments/PaywallModal";
import SignInModal from "@/components/SignInModal";
import SignUpModal from "@/components/SignUpModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  APP_ENV,
  IS_DEV_MODE,
  MOCK_PAYMENTS,
  PAYMENT_SYSTEM_ENABLED,
  PAYWALL_ENABLED,
} from "@/config/appConfig";
import { api } from "@/convex/_generated/api";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth(); // Auth status
  const { signOut } = useAuthActions(); // Sign-out action
  const user = useQuery(api.users.getCurrentUser); // Current-user details
  const [isOpen, setIsOpen] = useState(false); // User menu open state
  const [showSignInModal, setShowSignInModal] = useState(false); // Sign-in modal
  const [showSignUpModal, setShowSignUpModal] = useState(false); // Sign-up modal
  const [showPaywallModal, setShowPaywallModal] = useState(false); // Paywall preview modal
  const [isDebugOpen, setIsDebugOpen] = useState(false); // Debug console
  const [showLogoutDialog, setShowLogoutDialog] = useState(false); // Sign-out / delete dialog
  const [logoutStep, setLogoutStep] = useState<"main" | "deleteConfirm">("main");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);

  // Close the menus when clicking outside them.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }

      if (debugRef.current && !debugRef.current.contains(event.target as Node)) {
        setIsDebugOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.fullName || user?.email?.split("@")[0] || "friend";
  const updateUserType = useMutation(api.users.updateUserType);
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);

  const openLogoutDialog = () => {
    setIsOpen(false);
    setLogoutStep("main");
    setShowLogoutDialog(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowLogoutDialog(false);
  };

  const goToDeleteConfirm = () => {
    setIsOpen(false);
    setLogoutStep("deleteConfirm");
    setShowLogoutDialog(true);
  };

  // Two-step account deletion — this is the final confirm step.
  const confirmDeleteAccount = async () => {
    setIsDeleteLoading(true);
    try {
      await deleteMyAccount();
      // Sign out automatically after the account is deleted.
      await signOut();
      setShowLogoutDialog(false);
    } catch (_error) {
      // On failure we stay in the dialog so the user can retry.
      // TODO: surface a toast or inline error message.
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex max-w-[70vw] flex-wrap items-center gap-x-4 gap-y-2 sm:max-w-none sm:gap-x-6">
            <Link
              href="/"
              className="text-2xl hover:scale-110 transition-transform"
              aria-label="Home"
            >
              <Home className="w-6 h-6 text-foreground" />
            </Link>
            {[
              { href: "/today", label: "Today" },
              { href: "/tasks", label: "Tasks" },
              { href: "/notes", label: "Notes" },
              { href: "/calendar", label: "Calendar" },
              { href: "/coach", label: "Coach" },
              { href: "/habits", label: "Habits" },
              { href: "/goals", label: "Goals" },
              { href: "/settings/profile", label: "Settings" },
              { href: "/insights", label: "Insights" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-2"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {IS_DEV_MODE && (
              <div className="relative" ref={debugRef}>
                <Button
                  variant="ghost"
                  onClick={() => setIsDebugOpen((v) => !v)}
                  className="h-10 w-10 rounded-lg bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 hover:border-yellow-500/70"
                  aria-label="Debug console"
                >
                  <Bug className="h-5 w-5 text-yellow-400" />
                </Button>

                <div
                  className={[
                    "absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-orange-500/30 bg-gray-900/95 shadow-xl backdrop-blur-sm transition-all",
                    isDebugOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-bold text-white">Debug console</div>
                      <div className="text-xs text-gray-400">{APP_ENV}</div>
                    </div>

                    <div className="mb-4 space-y-1 text-xs text-gray-300">
                      <DebugRow label="Paywall enabled" value={PAYWALL_ENABLED ? "yes" : "no"} />
                      <DebugRow
                        label="Payments enabled"
                        value={PAYMENT_SYSTEM_ENABLED ? "yes" : "no"}
                      />
                      <DebugRow label="Mock payments" value={MOCK_PAYMENTS ? "yes" : "no"} />
                      <DebugRow
                        label="User status"
                        value={
                          user
                            ? user.userType === "paid"
                              ? "premium"
                              : "free"
                            : "signed out"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowSignInModal(true)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-left text-sm text-white transition hover:border-orange-500/40"
                      >
                        Open sign-in modal (preview)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSignUpModal(true)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-left text-sm text-white transition hover:border-orange-500/40"
                      >
                        Open sign-up modal (preview)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPaywallModal(true)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-left text-sm text-white transition hover:border-orange-500/40"
                      >
                        Open paywall (preview)
                      </button>

                      {MOCK_PAYMENTS && (
                        <button
                          type="button"
                          onClick={async () => {
                            await updateUserType({ userType: "paid" });
                          }}
                          className="w-full rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-left text-sm text-orange-100 transition hover:bg-orange-500/15"
                        >
                          Dev test: upgrade me to premium
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 hover:bg-accent rounded-lg px-3 py-2 h-auto"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Hi, {displayName}
                  </span>
                </Button>

                {isOpen && (
                  <Card className="absolute right-0 mt-2 w-72 shadow-lg border-border z-50">
                    <CardContent className="p-0">
                      <div className="px-4 py-4 border-b border-border bg-muted/50">
                        <p className="text-sm font-semibold text-foreground mb-1">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Button
                          variant="ghost"
                          onClick={openLogoutDialog}
                          className="w-full justify-start px-3 py-2 text-left hover:bg-destructive/10 text-destructive rounded-md"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Sign out</span>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={goToDeleteConfirm}
                          className="w-full justify-start px-3 py-2 text-left hover:bg-red-950/20 text-red-500 rounded-md border border-red-900/30"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Delete account</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowSignInModal(true)}
                className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition-all"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>

      <SignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onSwitchToSignUp={() => setShowSignUpModal(true)}
      />

      <SignUpModal
        open={showSignUpModal}
        onOpenChange={setShowSignUpModal}
        onSwitchToSignIn={() => setShowSignInModal(true)}
      />

      <PaywallModal open={showPaywallModal} onOpenChange={setShowPaywallModal} preview={true} />

      <Dialog
        open={showLogoutDialog}
        onOpenChange={(open) => {
          setShowLogoutDialog(open);
          if (!open) {
            setLogoutStep("main");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0">
          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-8">
            {logoutStep === "main" ? (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-white text-center">
                    Sign out of your account
                  </DialogTitle>
                  <p className="text-gray-400 text-center mt-2">
                    Ready to sign out? You can also delete your account permanently.
                  </p>
                </DialogHeader>

                <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900/40 p-4 text-left">
                  <div className="text-sm text-gray-400">Signed in as</div>
                  <div className="mt-1 text-base font-semibold text-white">{displayName}</div>
                  <div className="mt-1 text-xs text-gray-500 truncate">{user?.email || ""}</div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={confirmSignOut}
                    className="w-full rounded-xl bg-linear-to-r from-orange-500 to-red-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Sign out
                  </button>

                  <button
                    type="button"
                    onClick={goToDeleteConfirm}
                    className="w-full rounded-xl border-2 border-red-900 bg-red-950/30 px-6 py-3 font-bold text-red-200 transition hover:bg-red-950/40"
                  >
                    Delete account
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogoutDialog(false)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-900/40 px-6 py-3 font-semibold text-gray-200 transition hover:border-orange-500/30"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-white text-center">
                    Confirm account deletion
                  </DialogTitle>
                  <p className="text-gray-300 text-center mt-2 leading-relaxed">
                    This moves your account to Recently deleted — you can restore it within 30
                    days. After that it is permanently removed.
                  </p>
                </DialogHeader>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={confirmDeleteAccount}
                    disabled={isDeleteLoading}
                    className="w-full rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {isDeleteLoading ? "Deleting account…" : "Yes, delete my account"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoutStep("main")}
                    className="w-full rounded-xl border border-gray-700 bg-gray-900/40 px-6 py-3 font-semibold text-gray-200 transition hover:border-orange-500/30"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

// Small label/value row for the debug console.
function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-200">{value}</div>
    </div>
  );
}
