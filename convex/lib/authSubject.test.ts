import { describe, expect, test } from "bun:test";
import { userIdFromAuthSubject } from "./authSubject";

describe("userIdFromAuthSubject", () => {
  test("extracts the user id from a composite Convex Auth subject", () => {
    expect(userIdFromAuthSubject("authAccount123|user456")).toBe("user456");
  });

  test("returns null when subject is not composite", () => {
    expect(userIdFromAuthSubject("only-one-part")).toBeNull();
  });

  test("returns null for empty subject", () => {
    expect(userIdFromAuthSubject("")).toBeNull();
  });
});
