"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRIVACY_URL, TERMS_URL } from "@/config/appConfig";

const REMEMBERED_EMAIL_KEY = "remembered_email";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

// קומפוננטת מודל הרשמה
export default function SignUpModal({ open, onOpenChange, onSwitchToSignIn }: SignUpModalProps) {
  const { signIn } = useAuthActions(); // פעולת הרשמה (משתמשת באותה פונקציה כמו התחברות)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // זכור אותי
  const [showPassword, setShowPassword] = useState(false); // הצגת סיסמה
  const [consentAccepted, setConsentAccepted] = useState(false); // הסכמה לתנאי שימוש ופרטיות

  // טעינת אימייל שמור
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // בדיקה שהמשתמש אישר את תנאי השימוש ומדיניות הפרטיות
    if (!consentAccepted) {
      setError("אנא קראו ואשרו קודם את תנאי השימוש ומדיניות הפרטיות");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // יצירת משתמש חדש והתחברות (flow: "signUp")
      await signIn("password", { email, password, flow: "signUp" });

      // שמירה או מחיקה של האימייל מה-LocalStorage
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || "";

      // מיפוי שגיאות Convex Auth להודעות בעברית
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("AccountAlreadyExists")
      ) {
        setError("כתובת הדואר האלקטרוני כבר רשומה במערכת");
      } else if (errorMessage.includes("password") && errorMessage.includes("weak")) {
        setError("הסיסמה חלשה מדי. אנא בחרו סיסמה חזקה יותר");
      } else if (errorMessage.includes("TooManyRequests")) {
        setError("יותר מדי ניסיונות. אנא נסו שוב מאוחר יותר");
      } else if (errorMessage.includes("invalid") && errorMessage.includes("email")) {
        setError("כתובת הדואר האלקטרוני אינה תקינה");
      } else {
        setError("הרשמה נכשלה. אנא בדקו את הפרטים ונסו שוב");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignIn = () => {
    onOpenChange(false);
    onSwitchToSignIn?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-8" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white text-center">הרשמה</DialogTitle>
            <p className="text-gray-400 text-center mt-2">צרו חשבון חדש והצטרפו אלינו</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="signup-modal-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                דואר אלקטרוני
              </label>
              <input
                id="signup-modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="support@temporhythm.app"
                required={true}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="signup-modal-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="signup-modal-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required={true}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* תיבת סימון זכור אותי */}
            <div className="flex items-center gap-3">
              <input
                id="signup-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="signup-remember-me" className="text-sm text-gray-300 cursor-pointer">
                זכור אותי
              </label>
            </div>

            {/* תיבת סימון הסכמה לתנאי שימוש ומדיניות פרטיות */}
            <div className="flex items-start gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  id="signup-consent"
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="sr-only"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setConsentAccepted(!consentAccepted)}
                  disabled={isLoading}
                  className={`w-5 h-5 flex items-center justify-center rounded border-2 transition ${
                    consentAccepted
                      ? "bg-orange-500 border-orange-500"
                      : "bg-transparent border-gray-600 hover:border-gray-500"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {consentAccepted && <Check className="w-3 h-3 text-black" />}
                </button>
              </div>
              <label
                htmlFor="signup-consent"
                className="text-sm text-gray-300 flex-1 cursor-pointer"
              >
                אני מסכים ל
                <Link
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 font-semibold mx-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  תנאי השימוש
                </Link>
                ול
                <Link
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 font-semibold mr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  מדיניות הפרטיות
                </Link>
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !consentAccepted}
              className="w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>יוצר חשבון...</span>
                </div>
              ) : (
                "צור חשבון"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            כבר יש לכם חשבון?{" "}
            <button
              type="button"
              onClick={handleSwitchToSignIn}
              className="text-orange-500 hover:text-orange-400 font-semibold transition"
            >
              התחברו כאן
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
