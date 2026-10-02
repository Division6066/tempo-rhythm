"use client";

import { SignInForm } from "./SignInForm";

export type SignUpFormProps = {
  variant?: "page" | "modal";
  nextPath?: string;
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
};

/**
 * Sign-up is the same magic-link flow as sign-in: the first link a new email
 * opens creates the account.
 */
export function SignUpForm({
  variant = "modal",
  nextPath,
  onSuccess,
  onSwitchToSignIn,
}: SignUpFormProps) {
  const isPage = variant === "page";
  return (
    <div className={isPage ? "w-full max-w-md" : ""}>
      <SignInForm
        variant={variant}
        nextPath={nextPath}
        flow="sign-up"
        onSuccess={onSuccess}
        onSwitch={onSwitchToSignIn}
      />
    </div>
  );
}
