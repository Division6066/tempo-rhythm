import { describe, expect, test, mock } from "bun:test";
import { fetchCurrentUser } from "./users";

describe("users logic", () => {
  describe("fetchCurrentUser", () => {
    test("returns null when no identity", async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: async () => null,
        },
      } as any;

      const result = await fetchCurrentUser(mockCtx);
      expect(result).toBeNull();
    });

    test("parses subject and looks up by ID", async () => {
      const mockUser = { _id: "user_123", email: "test@test.com" };
      const mockCtx = {
        auth: {
          getUserIdentity: async () => ({
            subject: "auth_xyz|user_123",
          }),
        },
        db: {
          get: mock(async (id) => (id === "user_123" ? mockUser : null)),
        },
      } as any;

      const result = await fetchCurrentUser(mockCtx);
      expect(result).toEqual(mockUser);
      expect(mockCtx.db.get).toHaveBeenCalledWith("user_123");
    });

    test("falls back to email lookup when ID lookup fails", async () => {
      const mockUser = { _id: "user_123", email: "test@test.com" };
      const uniqueMock = mock(async () => mockUser);
      const withIndexMock = mock(() => ({ unique: uniqueMock }));
      const queryMock = mock(() => ({ withIndex: withIndexMock }));

      const mockCtx = {
        auth: {
          getUserIdentity: async () => ({
            subject: "auth_xyz",
            email: "test@test.com",
          }),
        },
        db: {
          query: queryMock,
        },
      } as any;

      const result = await fetchCurrentUser(mockCtx);
      expect(result).toEqual(mockUser);
      expect(queryMock).toHaveBeenCalledWith("users");
      expect(withIndexMock).toHaveBeenCalled();
    });
  });
});
