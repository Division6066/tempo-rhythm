"use client";

import { SignUpForm } from "@/components/auth/SignUpForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

// קומפוננטת מודל הרשמה (קישור קסם בלבד)
export default function SignUpModal({ open, onOpenChange, onSwitchToSignIn }: SignUpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-white text-center">
              Create account
            </DialogTitle>
          </DialogHeader>
          <SignUpForm
            variant="modal"
            onSwitchToSignIn={() => {
              onOpenChange(false);
              onSwitchToSignIn?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
