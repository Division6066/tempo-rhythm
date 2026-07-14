import { expect, test } from "@playwright/test";

const isBunTestRunner = typeof Bun !== "undefined";

if (!isBunTestRunner) {
	test("Today core flow creates, completes, and reloads a persisted task", async ({
		page,
	}) => {
		const consoleErrors: string[] = [];
		page.on("console", (message) => {
			if (message.type() === "error") {
				consoleErrors.push(message.text());
			}
		});

		const email = "today-e2e-clean@example.com";
		const password = "today-e2e-pass-1234";
		const taskTitle = `Tiny next step ${Date.now()}`;

		await page.goto(`/sign-up?next=${encodeURIComponent("/today")}`);
		await page.getByLabel("Email").fill(email);
		await page.getByRole("textbox", { name: "Password" }).fill(password);
		await page.getByLabel("Accept terms and privacy policy").click();
		await page.getByRole("button", { name: "Create account" }).click();

		const signUpResult = await Promise.race([
			page
				.waitForURL(/\/today$/, { timeout: 20_000 })
				.then(() => "signed-up" as const),
			page
				.getByRole("alert")
				.waitFor({ timeout: 20_000 })
				.then(() => "sign-up-error" as const),
		]);

		if (signUpResult === "sign-up-error") {
			await page.goto(`/sign-in?next=${encodeURIComponent("/today")}`);
			await page.getByLabel("Email").fill(email);
			await page.getByRole("textbox", { name: "Password" }).fill(password);
			await page.getByRole("button", { name: "Sign in" }).click();
		}

		await expect(page).toHaveURL(/\/today$/);
		await expect(page.getByRole("heading", { name: /^Hi,/ })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Today's agenda" }),
		).toBeVisible();
		await expect(
			page.getByText("No calendar events for today yet."),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Habit strip" }),
		).toBeVisible();
		await expect(page.getByText("Brain dump to plan")).toBeVisible();

		const quickAddInput = page.getByLabel("Add something small for today");
		await quickAddInput.fill(taskTitle);
		await page.getByRole("button", { name: /^Add$/ }).click();
		await expect(quickAddInput).toHaveValue("");
		await page.reload();
		await expect(page.getByText(taskTitle)).toBeVisible();

		await page
			.getByRole("button", { name: `Mark ${taskTitle} complete` })
			.click();
		await expect(page.getByText(taskTitle)).not.toBeVisible();

		await page.reload();
		await expect(page.getByText(taskTitle)).not.toBeVisible();

		await page.waitForLoadState("networkidle");
		expect(consoleErrors).toEqual([]);
	});
}
