"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const REMEMBERED_EMAIL_KEY = "remembered_email";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
}

// קומפוננטת מודל התחברות
export default function SignInModal({ open, onOpenChange, onSwitchToSignUp }: SignInModalProps) {
  const { signIn } = useAuthActions(); // פעולת התחברות
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // זכור אותי
  const [showPassword, setShowPassword] = useState(false); // הצגת סיסמה

  // טעינת אימייל שמור בעת טעינת הקומפוננטה
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      // ביצוע התחברות
      await signIn("password", { email, password, flow: "signIn" });

      // שמירה או מחיקה של האימייל מה-LocalStorage
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      onOpenChange(false); // סגירת המודל
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error.message || "";

      // מיפוי שגיאות Convex Auth להודעות בעברית
      if (errorMessage.includes("InvalidSecret")) {
        setError("הסיסמה שהוזנה שגויה");
      } else if (
        errorMessage.includes("InvalidAccountId") ||
        errorMessage.includes("Could not find")
      ) {
        setError("לא נמצא חשבון עם כתובת הדואר האלקטרוני הזו");
      } else if (errorMessage.includes("TooManyRequests")) {
        setError("יותר מדי ניסיונות התחברות. אנא נסו שוב מאוחר יותר");
      } else {
        setError("התחברות נכשלה. אנא בדקו את הפרטים ונסו שוב");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-8" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white text-center">התחברות</DialogTitle>
            <p className="text-gray-400 text-center mt-2">ברוכים השבים! אנא התחברו לחשבונכם</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-gray-300 mb-2">
                דואר אלקטרוני
              </label>
              <input
                id="modal-email"
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
                htmlFor="modal-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="modal-password"
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
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="text-sm text-gray-300 cursor-pointer">
                זכור אותי
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>מתחבר...</span>
                </div>
              ) : (
                "התחבר"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            עדיין אין לכם חשבון?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToSignUp?.();
              }}
              className="text-orange-500 hover:text-orange-400 font-semibold transition"
            >
              הירשמו כאן
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
