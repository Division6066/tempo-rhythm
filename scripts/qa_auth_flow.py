"""
Tempo Flow — targeted auth flow test.
Handles terms consent, verifies sign-up and sign-in end to end.
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

def run():
    ts = int(time.time())
    test_email = f"qa_{ts}@tempo.test"
    test_password = "QAtest123!"
    print(f"Test account: {test_email}")

    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

        # ── SIGN-UP ──────────────────────────────────────────────────────
        log("SIGN-UP FLOW")
        page.goto(f"{BASE_URL}/sign-up", wait_until="networkidle", timeout=20000)
        shot(page, "before_signup")

        # Fill email + password
        page.locator("#signup-email").fill(test_email)
        page.locator("#signup-password").fill(test_password)

        # Accept terms — the consent checkbox is a custom button (#signup-consent → button)
        consent_btn = page.locator("button[aria-label='Accept terms and privacy policy']")
        print(f"  Consent button visible: {consent_btn.is_visible()}")
        consent_btn.click()
        page.wait_for_timeout(300)
        shot(page, "signup_consent_checked")

        # Submit should now be enabled
        submit = page.locator("button[type='submit']")
        print(f"  Submit enabled: {submit.is_enabled()}")
        submit.click()

        try:
            page.wait_for_url(lambda url: "/sign-up" not in url, timeout=12000)
            print(f"  Sign-up success -> landed at: {page.url}")
            shot(page, "after_signup")
            signup_ok = True
        except Exception as e:
            print(f"  Sign-up redirect failed: {e}")
            # Check for error message on page
            errors = page.locator("[role='alert']").all_text_contents()
            print(f"  Error messages: {errors}")
            shot(page, "signup_failed")
            signup_ok = False

        # ── SIGN-OUT then SIGN-IN ────────────────────────────────────────
        log("SIGN-IN FLOW (fresh context)")
        ctx2 = browser.new_context(viewport={"width": 1280, "height": 800})
        p2 = ctx2.new_page()
        p2.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

        p2.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=20000)
        shot(p2, "before_signin")

        p2.locator("#signin-email").fill(test_email)
        p2.locator("#signin-password").fill(test_password)
        shot(p2, "signin_filled")
        p2.locator("button[type='submit']").click()

        try:
            p2.wait_for_url(lambda url: "/sign-in" not in url, timeout=12000)
            landed = p2.url
            print(f"  Sign-in success -> landed at: {landed}")
            shot(p2, "after_signin")

            # ── AUTHENTICATED ROUTES ─────────────────────────────────────
            log("AUTHENTICATED ROUTES")
            for route in ["/today", "/dashboard", "/tasks"]:
                p2.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=15000)
                final = p2.url
                gated = "/sign-in" in final
                print(f"  GET {route} -> {final}  {'[AUTH REQUIRED - not authed??]' if gated else '[OK - loaded]'}")
                h_texts = p2.locator("h1, h2").all_text_contents()
                print(f"    headings: {h_texts[:4]}")
                shot(p2, f"auth_{route.lstrip('/')}")

        except Exception as e:
            print(f"  Sign-in redirect failed: {e}")
            errors = p2.locator("[role='alert']").all_text_contents()
            print(f"  Error messages: {errors}")
            shot(p2, "signin_failed")

        ctx2.close()

        # ── SIGN-IN ERROR STATE ──────────────────────────────────────────
        log("SIGN-IN BAD PASSWORD (error state test)")
        ctx3 = browser.new_context(viewport={"width": 1280, "height": 800})
        p3 = ctx3.new_page()
        p3.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=15000)
        p3.locator("#signin-email").fill(test_email)
        p3.locator("#signin-password").fill("wrongpassword")
        p3.locator("button[type='submit']").click()
        p3.wait_for_timeout(3000)
        errors = p3.locator("[role='alert']").all_text_contents()
        print(f"  Error displayed: {errors}")
        shot(p3, "signin_bad_password")
        ctx3.close()

        # ── SUMMARY ──────────────────────────────────────────────────────
        log("SUMMARY")
        print(f"Console errors ({len(console_errors)}):")
        for e in console_errors[:8]:
            print(f"  {e}")
        print(f"\nSign-up: {'OK' if signup_ok else 'FAILED'}")

        browser.close()
        print(f"\nScreenshots in {SCREENSHOT_DIR}")

if __name__ == "__main__":
    run()
