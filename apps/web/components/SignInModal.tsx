"use client";

import { SignInForm } from "@/components/auth/SignInForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
}

// קומפוננטת מודל התחברות (קישור קסם בלבד)
export default function SignInModal({ open, onOpenChange, onSwitchToSignUp }: SignInModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white text-center">Sign in</DialogTitle>
          </DialogHeader>
          <SignInForm
            variant="modal"
            flow="sign-in"
            onSwitch={() => {
              onOpenChange(false);
              onSwitchToSignUp?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
