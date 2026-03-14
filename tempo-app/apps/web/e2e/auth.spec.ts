import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByText("Don't have an account?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create account")).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("At least 6 characters")).toBeVisible();
    await expect(page.getByPlaceholder("Confirm your password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("login form shows validation errors", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("signup form shows validation errors", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("signup validates password length", async ({ page }) => {
    await page.goto("/signup");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("At least 6 characters").fill("123");
    await page.getByPlaceholder("Confirm your password").fill("123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });

  test("signup validates password match", async ({ page }) => {
    await page.goto("/signup");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("At least 6 characters").fill("password123");
    await page.getByPlaceholder("Confirm your password").fill("password456");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("login page links to signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("signup page links to login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated users are redirected from protected routes", async ({ page }) => {
    const protectedRoutes = ["/today", "/inbox", "/chat", "/plan", "/notes", "/projects", "/settings", "/calendar", "/filters", "/templates"];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
