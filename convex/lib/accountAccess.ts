export type AccountAccessUser = {
  deletedAt?: number;
  isActive?: boolean;
};

export const INACTIVE_ACCOUNT_MESSAGE =
  "This account is not active. Please contact support.";

/** Throws when a user record should not be allowed to start a session. */
export function assertAccountCanSignIn(user: AccountAccessUser): void {
  if (user.deletedAt !== undefined || user.isActive === false) {
    throw new Error(INACTIVE_ACCOUNT_MESSAGE);
  }
}
