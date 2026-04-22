"""
Tempo Flow — local QA script
Tests auth flow, main routes, and /today slice.
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright, Page, expect

BASE_URL = "http://localhost:3000"
SCREENSHOT_DIR = "/tmp/tempo_qa"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

console_errors = []
network_errors = []

def shot(page: Page, name: str):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"  📸 {path}")
    return path

def log(msg):
    print(f"\n{'='*60}\n{msg}\n{'='*60}")

def check_for_hebrew(page: Page, route: str):
    content = page.content()
    # Basic Hebrew unicode range U+0590–U+05FF
    hebrew_chars = [c for c in content if '\u0590' <= c <= '\u05ff']
    if hebrew_chars:
        print(f"  ⚠️  HEBREW DETECTED on {route}: {len(hebrew_chars)} chars — first 3: {''.join(hebrew_chars[:3])}")
    else:
        print(f"  ✅ No Hebrew on {route}")

def run_qa():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir=SCREENSHOT_DIR,
        )
        page = context.new_page()

        # Capture console errors
        def on_console(msg):
            if msg.type in ("error", "warning"):
                console_errors.append(f"[{msg.type}] {msg.text}")

        def on_response(response):
            if response.status >= 400:
                network_errors.append(f"HTTP {response.status} — {response.url}")

        page.on("console", on_console)
        page.on("response", on_response)

        # ── 1. ROOT / → where does it go? ─────────────────────────────────
        log("1. Root redirect")
        page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        print(f"  URL after load: {page.url}")
        shot(page, "01_root")
        check_for_hebrew(page, "/")

        # ── 2. SIGN-IN page ───────────────────────────────────────────────
        log("2. /sign-in page load")
        page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=20000)
        print(f"  URL: {page.url}")
        shot(page, "02_sign_in")
        check_for_hebrew(page, "/sign-in")

        # Inspect the sign-in form
        inputs = page.locator("input").all()
        print(f"  Inputs found: {len(inputs)}")
        for i, inp in enumerate(inputs):
            t = inp.get_attribute("type") or "text"
            ph = inp.get_attribute("placeholder") or ""
            print(f"    input[{i}] type={t} placeholder={ph!r}")

        buttons = page.locator("button").all()
        print(f"  Buttons found: {len(buttons)}")
        for b in buttons:
            print(f"    button: {b.inner_text().strip()!r}")

        # ── 3. SIGN-UP flow ──────────────────────────────────────────────
        log("3. /sign-up — navigate and inspect")
        page.goto(f"{BASE_URL}/sign-up", wait_until="networkidle", timeout=20000)
        print(f"  URL: {page.url}")
        shot(page, "03_sign_up")
        check_for_hebrew(page, "/sign-up")

        signup_inputs = page.locator("input").all()
        print(f"  Inputs found: {len(signup_inputs)}")
        for i, inp in enumerate(signup_inputs):
            t = inp.get_attribute("type") or "text"
            ph = inp.get_attribute("placeholder") or ""
            print(f"    input[{i}] type={t} placeholder={ph!r}")

        # ── 4. Attempt sign-up with test user ────────────────────────────
        log("4. Sign-up attempt with test@tempo.local")
        ts = int(time.time())
        test_email = f"qa_{ts}@tempo.test"
        test_password = "QAtest123!"

        email_input = page.locator("input[type='email'], input[name='email'], input[placeholder*='mail' i]").first
        pw_input = page.locator("input[type='password']").first

        try:
            email_input.fill(test_email)
            pw_input.fill(test_password)
            shot(page, "04_signup_filled")
            submit = page.locator("button[type='submit'], button:has-text('Sign up'), button:has-text('Create'), button:has-text('Register')").first
            submit.click()
            page.wait_for_url(lambda url: "/sign-in" not in url and "/sign-up" not in url, timeout=10000)
            print(f"  ✅ Sign-up redirected to: {page.url}")
            shot(page, "05_after_signup")
        except Exception as e:
            print(f"  ❌ Sign-up failed: {e}")
            shot(page, "05_signup_error")
            # Fall through to sign-in attempt

        # ── 5. Sign-in attempt ───────────────────────────────────────────
        log("5. Sign-in attempt")
        page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=20000)
        try:
            email_in = page.locator("input[type='email'], input[name='email'], input[placeholder*='mail' i]").first
            pw_in = page.locator("input[type='password']").first
            email_in.fill(test_email)
            pw_in.fill(test_password)
            shot(page, "06_signin_filled")
            submit = page.locator("button[type='submit'], button:has-text('Sign in'), button:has-text('Login')").first
            submit.click()
            page.wait_for_url(lambda url: "/sign-in" not in url, timeout=10000)
            print(f"  ✅ Sign-in redirected to: {page.url}")
            shot(page, "07_after_signin")
            check_for_hebrew(page, "post-signin")
        except Exception as e:
            print(f"  ❌ Sign-in failed: {e}")
            shot(page, "07_signin_error")

        # ── 6. Protected routes check (unauthenticated) ──────────────────
        log("6. Protected route test (fresh context, unauthenticated)")
        ctx2 = browser.new_context(viewport={"width": 1280, "height": 800})
        p2 = ctx2.new_page()
        for route in ["/today", "/dashboard", "/tasks"]:
            p2.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=15000)
            final_url = p2.url
            protected = "/sign-in" in final_url or "/sign-up" in final_url or final_url == BASE_URL + "/"
            status = "✅ redirected" if protected else f"⚠️  landed at {final_url} (not gated?)"
            print(f"  GET {route} → {final_url}  [{status}]")
        ctx2.close()

        # ── 7. Authenticated routes ──────────────────────────────────────
        log("7. Authenticated route tests")
        current_url = page.url
        if "/sign-in" in current_url or "/sign-up" in current_url:
            print("  ⚠️  Not authenticated — skipping authenticated route tests")
        else:
            for route in ["/today", "/dashboard", "/tasks"]:
                try:
                    page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=15000)
                    print(f"  GET {route} → {page.url}")
                    shot(page, f"auth_{route.lstrip('/')}")
                    check_for_hebrew(page, route)

                    # Check empty state / loading state
                    has_spinner = page.locator("[class*='spin'], [class*='load'], [aria-busy='true']").count() > 0
                    has_empty   = page.locator("[class*='empty'], [data-empty]").count() > 0
                    h1s = page.locator("h1, h2").all_text_contents()
                    print(f"    h1/h2: {h1s[:3]}")
                    print(f"    spinner: {has_spinner}  empty-state: {has_empty}")
                except Exception as e:
                    print(f"  ❌ {route} error: {e}")
                    shot(page, f"err_{route.lstrip('/')}")

        # ── 8. /today quick-add task (if present) ───────────────────────
        log("8. /today quick-add test")
        if "/sign-in" not in page.url and "/sign-up" not in page.url:
            page.goto(f"{BASE_URL}/today", wait_until="networkidle", timeout=15000)
            qa_input = page.locator(
                "input[placeholder*='add' i], input[placeholder*='task' i], "
                "input[placeholder*='quick' i], textarea[placeholder*='add' i]"
            ).first
            if qa_input.count():
                qa_input.fill("QA test task from Playwright")
                shot(page, "today_quick_add_filled")
                qa_input.press("Enter")
                page.wait_for_timeout(1500)
                shot(page, "today_quick_add_result")
                # Check task appears
                task_visible = page.locator("text=QA test task from Playwright").count() > 0
                print(f"  Task appeared after add: {task_visible}")
            else:
                print("  ⚠️  No quick-add input found on /today")
                # List all inputs
                all_inputs = page.locator("input, textarea").all()
                for inp in all_inputs:
                    ph = inp.get_attribute("placeholder") or ""
                    print(f"    input placeholder={ph!r}")
        else:
            print("  ⚠️  Skipped — not authenticated")

        # ── 9. Mobile viewport check ─────────────────────────────────────
        log("9. Mobile viewport (375px)")
        ctx3 = browser.new_context(viewport={"width": 375, "height": 812})
        p3 = ctx3.new_page()
        p3.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=15000)
        shot(p3, "mobile_sign_in")
        p3.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
        shot(p3, "mobile_root")
        ctx3.close()

        # ── Summary ──────────────────────────────────────────────────────
        log("SUMMARY")
        print(f"Console errors ({len(console_errors)}):")
        for e in console_errors[:10]:
            print(f"  {e}")
        print(f"\nNetwork errors ({len(network_errors)}):")
        for e in network_errors[:10]:
            print(f"  {e}")

        browser.close()
        print(f"\n✅ QA complete — screenshots in {SCREENSHOT_DIR}")

if __name__ == "__main__":
    run_qa()
