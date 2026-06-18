export type SessionAccount = {
  deletedAt?: number;
  isActive?: boolean;
};

export function assertAccountActiveForSession(user: SessionAccount | null): void {
  if (!user) {
    throw new Error("We couldn't load your account yet. Please try again.");
  }
  if (user.deletedAt !== undefined || user.isActive === false) {
    throw new Error("This account is not active. Please contact support.");
  }
}
