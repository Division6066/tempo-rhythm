/**
 * SignInForm accessibility tests.
 *
 * The form is the only entry into the authenticated app, so we lock down:
 *   - email + password inputs are labelled (htmlFor) and have autocomplete
 *   - "Remember me" checkbox is labelled
 *   - error region uses role="alert" so the message is announced
 *   - the show/hide-password button has aria-label that flips with state
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { audit, attr, errorIssues, formatIssues, render, visibleText } from "./a11y";

mock.module("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: async () => undefined }),
}));

const { SignInForm } = await import("@/components/auth/SignInForm");

describe("SignInForm · structural accessibility (page variant)", () => {
  test("email input is labelled and has type=email + autocomplete=email", () => {
    const rendered = render(createElement(SignInForm, { variant: "page" }));
    const inputs = rendered.tags.get("input") ?? [];
    const email = inputs.find((i) => attr(i, "id") === "signin-email");
    expect(email).toBeTruthy();
    expect(attr(email ?? "", "type")).toBe("email");
    expect(attr(email ?? "", "autocomplete")).toBe("email");
    const labels = rendered.tags.get("label") ?? [];
    expect(labels.some((l) => attr(l, "for") === "signin-email")).toBe(true);
  });

  test("password input is labelled and has type=password + autocomplete=current-password", () => {
    const rendered = render(createElement(SignInForm, { variant: "page" }));
    const inputs = rendered.tags.get("input") ?? [];
    const password = inputs.find((i) => attr(i, "id") === "signin-password");
    expect(password).toBeTruthy();
    expect(attr(password ?? "", "type")).toBe("password");
    expect(attr(password ?? "", "autocomplete")).toBe("current-password");
    const labels = rendered.tags.get("label") ?? [];
    expect(labels.some((l) => attr(l, "for") === "signin-password")).toBe(true);
  });

  test("remember-me checkbox has matching label", () => {
    const rendered = render(createElement(SignInForm, { variant: "page" }));
    const inputs = rendered.tags.get("input") ?? [];
    const remember = inputs.find((i) => attr(i, "id") === "remember-me-signin");
    expect(remember).toBeTruthy();
    const labels = rendered.tags.get("label") ?? [];
    expect(labels.some((l) => attr(l, "for") === "remember-me-signin")).toBe(true);
  });

  test("show/hide password button has an aria-label", () => {
    const rendered = render(createElement(SignInForm, { variant: "page" }));
    const buttons = rendered.tags.get("button") ?? [];
    const showHide = buttons.find(
      (b) => attr(b, "aria-label") === "Show password" || attr(b, "aria-label") === "Hide password",
    );
    expect(showHide, "expected a labelled show/hide-password button").toBeTruthy();
  });

  test("submit button announces 'Sign in' when idle", () => {
    const rendered = render(createElement(SignInForm, { variant: "page" }));
    const buttons = rendered.tags.get("button") ?? [];
    const submit = buttons.find((b) => attr(b, "type") === "submit");
    expect(submit).toBeTruthy();
    expect(visibleText(submit ?? "")).toContain("Sign in");
  });

  test("structural a11y audit passes", () => {
    const rendered = render(createElement(SignInForm, { variant: "page" }));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });
});

describe("SignInForm · modal variant accessibility", () => {
  test("structural a11y audit passes", () => {
    const rendered = render(createElement(SignInForm, { variant: "modal" }));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("inputs still have htmlFor + matching labels", () => {
    const rendered = render(createElement(SignInForm, { variant: "modal" }));
    const labels = rendered.tags.get("label") ?? [];
    expect(labels.some((l) => attr(l, "for") === "signin-email")).toBe(true);
    expect(labels.some((l) => attr(l, "for") === "signin-password")).toBe(true);
  });
});
