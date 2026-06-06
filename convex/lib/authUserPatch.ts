type ExistingUserPatchArgs = {
  email: string;
  emailVerified: boolean;
  fullName: string;
  isFounder: boolean;
  now: number;
};

type ExistingUserPatch = {
  email: string;
  emailVerified: boolean;
  fullName: string;
  updatedAt: number;
  betaAccess?: "founder";
  entitlementTier?: "god";
  isGodTier?: true;
  userType?: "paid";
};

export function buildExistingUserPatch({
  email,
  emailVerified,
  fullName,
  isFounder,
  now,
}: ExistingUserPatchArgs): ExistingUserPatch {
  const basePatch = {
    email,
    emailVerified,
    fullName,
    updatedAt: now,
  };

  if (!isFounder) {
    return basePatch;
  }

  return {
    ...basePatch,
    betaAccess: "founder",
    entitlementTier: "god",
    isGodTier: true,
    userType: "paid",
  };
}
