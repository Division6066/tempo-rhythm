"""
Local QA script for Tempo web app at http://localhost:3000
Tests: auth flow, protected routes, /today, /dashboard, /tasks
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright, Page, Browser

BASE = "http://localhost:3000"
SCREENSHOTS = "/tmp/tempo_qa"
os.makedirs(SCREENSHOTS, exist_ok=True)

FINDINGS = []

def shot(page: Page, name: str):
    path = f"{SCREENSHOTS}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"  📸 {path}")
    return path

def log(severity: str, msg: str, detail: str = ""):
    tag = {"CRIT": "🔴", "HIGH": "🟠", "MED": "🟡", "INFO": "🔵", "PASS": "✅"}.get(severity, "•")
    line = f"{tag} [{severity}] {msg}"
    if detail:
        line += f"\n       {detail}"
    print(line)
    FINDINGS.append((severity, msg, detail))

def get_console_errors(page: Page):
    errors = []
    page.on("console", lambda msg: errors.append((msg.type, msg.text)) if msg.type == "error" else None)
    return errors

def wait_and_shot(page: Page, name: str, wait_ms: int = 2000):
    page.wait_for_timeout(wait_ms)
    try:
        page.wait_for_load_state("networkidle", timeout=8000)
    except Exception:
        pass
    return shot(page, name)

def run_qa():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        network_fails = []
        page.on("response", lambda r: network_fails.append(f"{r.status} {r.url}") if r.status >= 400 else None)

        # ─── 1. Root redirect ───────────────────────────────────────────────
        print("\n=== 1. Root URL redirect ===")
        try:
            page.goto(BASE, timeout=15000)
            page.wait_for_timeout(3000)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass
            url = page.url
            title = page.title()
            shot(page, "01_root")
            print(f"  Landed at: {url}")
            print(f"  Title: {title}")
            if "/sign-in" in url or "/login" in url:
                log("PASS", f"Root → sign-in redirect works ({url})")
            elif "/today" in url or "/dashboard" in url:
                log("PASS", f"Root → authenticated landing ({url})")
            else:
                log("MED", f"Root landed at unexpected URL: {url}")
        except Exception as e:
            log("CRIT", "Root URL failed to load", str(e))
            browser.close()
            return

        # ─── 2. Sign-in page ────────────────────────────────────────────────
        print("\n=== 2. Sign-in page ===")
        page.goto(f"{BASE}/sign-in", timeout=15000)
        page.wait_for_timeout(2000)
        try:
            page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        shot(page, "02_signin_page")
        signin_url = page.url
        print(f"  URL: {signin_url}")

        # Check for Hebrew / RTL text
        content = page.content()
        hebrew_chars = [c for c in content if '\u0590' <= c <= '\u05FF']
        if hebrew_chars:
            log("HIGH", f"Hebrew text detected on sign-in page ({len(hebrew_chars)} chars)")
        else:
            log("PASS", "No Hebrew text on sign-in page")

        # Find email + password inputs
        email_input = page.locator("input[type=email], input[name=email], input[placeholder*='mail' i]").first
        pass_input = page.locator("input[type=password]").first

        email_visible = email_input.is_visible() if email_input.count() > 0 else False
        pass_visible = pass_input.is_visible() if pass_input.count() > 0 else False

        print(f"  Email input visible: {email_visible}")
        print(f"  Password input visible: {pass_visible}")

        if not email_visible:
            log("HIGH", "No email input found on /sign-in")
        if not pass_visible:
            log("HIGH", "No password input found on /sign-in")

        # Check buttons
        buttons = page.locator("button").all()
        btn_texts = []
        for b in buttons:
            try:
                btn_texts.append(b.inner_text().strip())
            except Exception:
                pass
        print(f"  Buttons: {btn_texts}")

        # ─── 3. Sign-up flow ────────────────────────────────────────────────
        print("\n=== 3. Sign-up attempt ===")
        test_email = f"qa-test-{int(time.time())}@tempo.test"
        test_pass = "TestPass123!"
        page.goto(f"{BASE}/sign-up", timeout=15000)
        page.wait_for_timeout(2000)
        try:
            page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        shot(page, "03_signup_page")
        signup_url = page.url
        print(f"  URL: {signup_url}")

        signup_email = page.locator("input[type=email], input[name=email]").first
        signup_pass = page.locator("input[type=password]").first

        if signup_email.count() > 0 and signup_pass.count() > 0:
            try:
                signup_email.fill(test_email)
                signup_pass.fill(test_pass)
                shot(page, "03b_signup_filled")
                # Find submit button
                submit = page.locator("button[type=submit], button:has-text('Sign up'), button:has-text('Create'), button:has-text('Register')").first
                if submit.count() > 0:
                    submit.click()
                    page.wait_for_timeout(4000)
                    try:
                        page.wait_for_load_state("networkidle", timeout=10000)
                    except Exception:
                        pass
                    post_signup_url = page.url
                    shot(page, "04_post_signup")
                    print(f"  Post-signup URL: {post_signup_url}")
                    if "/today" in post_signup_url or "/dashboard" in post_signup_url:
                        log("PASS", f"Sign-up succeeded → {post_signup_url}")
                        authenticated = True
                    elif "/sign-in" in post_signup_url or "/sign-up" in post_signup_url:
                        # Check for error message
                        page_text = page.inner_text("body")
                        error_snippets = [l for l in page_text.split("\n") if any(w in l.lower() for w in ["error", "invalid", "failed", "already"])]
                        log("HIGH", f"Sign-up did not redirect to app (still at {post_signup_url})", f"Errors found: {error_snippets[:3]}")
                        authenticated = False
                    else:
                        log("MED", f"Sign-up landed at unexpected URL: {post_signup_url}")
                        authenticated = False
                else:
                    log("HIGH", "No submit button found on sign-up page")
                    authenticated = False
            except Exception as e:
                log("HIGH", "Sign-up form interaction failed", str(e))
                authenticated = False
        else:
            log("HIGH", "Sign-up page has no email/password inputs")
            authenticated = False

        # ─── 4. Sign-in with credentials ────────────────────────────────────
        if not authenticated:
            print("\n=== 4. Sign-in attempt (fallback) ===")
            page.goto(f"{BASE}/sign-in", timeout=15000)
            page.wait_for_timeout(2000)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass
            email_inp = page.locator("input[type=email], input[name=email]").first
            pass_inp = page.locator("input[type=password]").first
            if email_inp.count() > 0 and pass_inp.count() > 0:
                email_inp.fill(test_email)
                pass_inp.fill(test_pass)
                submit = page.locator("button[type=submit], button:has-text('Sign in'), button:has-text('Login')").first
                if submit.count() > 0:
                    submit.click()
                    page.wait_for_timeout(4000)
                    try:
                        page.wait_for_load_state("networkidle", timeout=10000)
                    except Exception:
                        pass
                    post_signin_url = page.url
                    shot(page, "04b_post_signin")
                    print(f"  Post-signin URL: {post_signin_url}")
                    if "/today" in post_signin_url or "/dashboard" in post_signin_url:
                        log("PASS", f"Sign-in succeeded → {post_signin_url}")
                        authenticated = True
                    else:
                        page_text = page.inner_text("body")
                        log("CRIT", f"Sign-in did not redirect to app (at {post_signin_url})")
        
        # ─── 5. Protected route enforcement ─────────────────────────────────
        print("\n=== 5. Protected route test (/today while not authed) ===")
        context2 = browser.new_context(viewport={"width": 1280, "height": 800})
        page2 = context2.new_page()
        page2.goto(f"{BASE}/today", timeout=15000)
        page2.wait_for_timeout(2000)
        try:
            page2.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        protected_url = page2.url
        shot(page2, "05_protected_route")
        print(f"  Unauthenticated /today landed at: {protected_url}")
        if "/sign-in" in protected_url or "/login" in protected_url:
            log("PASS", "Protected route correctly redirects unauthenticated users to sign-in")
        else:
            log("HIGH", f"Protected route /today NOT redirecting unauthenticated users (at {protected_url})")
        page2.close()
        context2.close()

        # ─── 6. Authenticated app routes ────────────────────────────────────
        if authenticated:
            for route, name in [("/today", "06_today"), ("/dashboard", "07_dashboard"), ("/tasks", "08_tasks")]:
                print(f"\n=== Route: {route} ===")
                page.goto(f"{BASE}{route}", timeout=15000)
                page.wait_for_timeout(3000)
                try:
                    page.wait_for_load_state("networkidle", timeout=10000)
                except Exception:
                    pass
                final_url = page.url
                shot(page, name)
                print(f"  Final URL: {final_url}")

                if "/sign-in" in final_url:
                    log("CRIT", f"{route} → redirected to sign-in (auth lost?)")
                    continue

                # Check for 404 / error
                body_text = page.inner_text("body")
                if "404" in body_text[:200] or "not found" in body_text.lower()[:200]:
                    log("HIGH", f"{route} shows 404/not found")
                elif "error" in body_text.lower()[:500]:
                    snippets = [l for l in body_text.split("\n") if "error" in l.lower()][:3]
                    log("MED", f"{route} may have error state", str(snippets))
                else:
                    log("PASS", f"{route} loaded ({len(body_text)} chars)")

                # Hebrew check
                html = page.content()
                heb = [c for c in html if '\u0590' <= c <= '\u05FF']
                if heb:
                    log("HIGH", f"Hebrew text on {route} ({len(heb)} chars)")

                # Check mobile width
                page.set_viewport_size({"width": 375, "height": 812})
                page.wait_for_timeout(800)
                shot(page, f"{name}_mobile")
                page.set_viewport_size({"width": 1280, "height": 800})

        # ─── 7. /today quick-add task ────────────────────────────────────────
        if authenticated:
            print("\n=== 7. /today quick-add task flow ===")
            page.goto(f"{BASE}/today", timeout=15000)
            page.wait_for_timeout(3000)
            try:
                page.wait_for_load_state("networkidle", timeout=10000)
            except Exception:
                pass

            if "/today" in page.url:
                # Look for quick-add input
                quick_add = page.locator(
                    "input[placeholder*='add' i], input[placeholder*='task' i], input[placeholder*='capture' i], "
                    "input[placeholder*='what' i], textarea[placeholder*='add' i], textarea[placeholder*='task' i]"
                ).first

                if quick_add.count() > 0:
                    quick_add.fill("QA test task from Playwright")
                    page.keyboard.press("Enter")
                    page.wait_for_timeout(2000)
                    shot(page, "09_today_task_added")
                    body = page.inner_text("body")
                    if "QA test task from Playwright" in body:
                        log("PASS", "/today quick-add: task appears immediately after submit")
                    else:
                        log("MED", "/today quick-add: task not visible after submit (may need Convex subscription)")
                else:
                    log("MED", "/today: no quick-add input found — slice may not be present yet")
                    shot(page, "09_today_no_quickadd")
            else:
                log("CRIT", "/today redirected away when authenticated")

        # ─── 8. Console errors summary ───────────────────────────────────────
        print("\n=== Console errors captured ===")
        if console_errors:
            for e in console_errors[:10]:
                log("HIGH", "Console error", e)
        else:
            log("PASS", "No console errors during session")

        # Network failures
        relevant_fails = [f for f in network_fails if not any(x in f for x in ["favicon", "hot-update", "_next/static"])]
        if relevant_fails:
            for f in relevant_fails[:5]:
                log("MED", "Network failure", f)
        else:
            log("PASS", "No significant network failures")

        browser.close()

    # ─── Summary ──────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("QA FINDINGS SUMMARY")
    print("="*60)
    severity_order = {"CRIT": 0, "HIGH": 1, "MED": 2, "INFO": 3, "PASS": 4}
    sorted_findings = sorted(FINDINGS, key=lambda x: severity_order.get(x[0], 5))
    for sev, msg, detail in sorted_findings:
        tag = {"CRIT": "🔴", "HIGH": "🟠", "MED": "🟡", "INFO": "🔵", "PASS": "✅"}.get(sev, "•")
        print(f"{tag} [{sev}] {msg}")
        if detail:
            print(f"       {detail}")
    
    print(f"\nScreenshots saved to: {SCREENSHOTS}/")
    return sorted_findings

if __name__ == "__main__":
    run_qa()
