"""
Tempo Flow — targeted auth flow check for magic-link sign-in and sign-up.

Web sign-up requires an explicit Terms and Privacy acceptance before the
magic link can be sent. This script does not open that email: there is no
mailbox here, and completing the link needs the message Resend sends.
"""
import os
import time
from playwright.sync_api import sync_playwright, Page

BASE_URL = "http://localhost:3000"
SCREENSHOT_DIR = "/tmp/tempo_qa"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def shot(page: Page, name: str):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"  screenshot: {path}")


def log(msg):
    print(f"\n{'='*60}\n{msg}\n{'='*60}")


def assert_no_password_field(page: Page, label: str):
    count = page.locator("input[type=password]").count()
    print(f"  {label} password inputs: {count}")
    if count != 0:
        raise SystemExit(f"{label} still has a password field")


def send_magic_link(page: Page, email_selector: str, email: str, accept_terms: bool):
    page.locator(email_selector).fill(email)
    assert_no_password_field(page, email_selector)
    submit = page.locator("button[type='submit']")
    if accept_terms:
        print(f"  Submit enabled before consent: {submit.is_enabled()}")
        if submit.is_enabled():
            raise SystemExit("Sign-up submit is enabled before terms are accepted")
        page.locator("button[aria-label='Accept terms and privacy policy']").click()
        page.wait_for_timeout(300)
    print(f"  Submit enabled: {submit.is_enabled()}")
    submit.click()
    page.get_by_text("Check your email").wait_for(timeout=12000)
    print("  Magic link requested; inbox step is not run from this script")


def run():
    ts = int(time.time())
    test_email = f"qa_{ts}@tempo.test"
    print(f"Test email: {test_email}")

    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        page.on(
            "console",
            lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None,
        )

        log("SIGN-UP FLOW")
        page.goto(f"{BASE_URL}/sign-up", wait_until="networkidle", timeout=20000)
        shot(page, "before_signup")
        send_magic_link(page, "#sign-up-email", test_email, accept_terms=True)
        shot(page, "after_signup_link_sent")
        print(f"  Still on: {page.url}")

        log("SIGN-IN FLOW")
        page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=20000)
        shot(page, "before_signin")
        send_magic_link(page, "#sign-in-email", test_email, accept_terms=False)
        shot(page, "after_signin_link_sent")
        print(f"  Still on: {page.url}")

        log("SUMMARY")
        print(f"Console errors ({len(console_errors)}):")
        for entry in console_errors[:8]:
            print(f"  {entry}")
        print("Sign-up and sign-in both stopped at the magic-link sent screen.")
        print("Opening the emailed link is not part of this script.")

        browser.close()
        print(f"\nScreenshots in {SCREENSHOT_DIR}")


if __name__ == "__main__":
    run()
