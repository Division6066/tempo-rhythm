# TEMPO — Founder's Personal Launch Checklist

This checklist covers everything the founder needs to handle personally before launch. These are action items that cannot be automated and require manual effort, registrations, or decisions.

---

## Legal / Compliance

- [ ] **Register database with Israeli PPA** — Under the Protection of Privacy Law (5741-1981), databases containing personal data must be registered with the Israeli Privacy Protection Authority (Rashut HaHagana Al HaPratiyut). File registration at [https://www.gov.il/en/departments/privacy_protection_authority](https://www.gov.il/en/departments/privacy_protection_authority)
- [ ] **Appoint a Data Protection Officer (DPO)** — Evaluate whether your data processing activities require a dedicated DPO. Recommended if processing sensitive personal data at scale
- [ ] **GDPR considerations for EU users** — If you plan to serve users in the EU, review GDPR compliance requirements: lawful basis for processing, data subject rights, Data Protection Impact Assessment (DPIA), and appoint an EU representative if you have no EU establishment
- [ ] **Have legal policies reviewed by an Israeli attorney** — The Privacy Policy, Terms of Service, and Cookie Policy on the website are template-quality. Have them reviewed and customized by a lawyer licensed in Israel
- [ ] **Draft and finalize refund policy** — The current Terms include a basic 14-day refund policy. Confirm this aligns with your business model and local consumer protection requirements
- [ ] **Review and comply with Israeli Consumer Protection Law** — Ensure compliance with the Israeli Consumer Protection Law (1981) regarding subscription cancellation and cooling-off periods
- [ ] **Accessibility compliance** — Review the app and website against WCAG 2.1 AA guidelines and Israeli Standard IS 5568 for accessibility

---

## Business

- [ ] **Register business entity in Israel** — Register Tempo Labs as a legal entity (Ltd/LLC equivalent) with the Israeli Registrar of Companies
- [ ] **Trademark TEMPO** — File for trademark registration with the Israel Patent Office (Reshut HaPatentim) for the TEMPO name and logo in relevant classes (Class 9 for software, Class 42 for SaaS)
- [ ] **Set up a business bank account** — Open a dedicated business account with an Israeli bank for revenue collection and expenses
- [ ] **Get business insurance** — Obtain professional liability insurance (errors & omissions), cyber liability insurance, and general commercial liability coverage
- [ ] **Set up accounting and tax compliance** — Register with Israeli Tax Authority (Rashut HaMisim) for VAT, corporate tax, and payroll (if applicable). Consider hiring a bookkeeper/accountant
- [ ] **Terms of service for payment processing** — Set up a Stripe or equivalent payment processor account and complete business verification

---

## App Stores

- [ ] **Apple Developer Program enrollment** — Enroll at [developer.apple.com](https://developer.apple.com/programs/) ($99/year). Requires a D-U-N-S Number if registering as an organization
- [ ] **Google Play Developer registration** — Register at [play.google.com/console](https://play.google.com/console) (one-time $25 fee)
- [ ] **Prepare App Store assets** — Create the following for both stores:
  - App icon (1024x1024 for iOS, 512x512 for Android)
  - Screenshots for all required device sizes (iPhone 6.7", 6.5", 5.5"; iPad; Android phone/tablet)
  - App preview video (optional but recommended, 15-30 seconds)
  - Short description (80 chars for Google Play)
  - Full description (4000 chars max)
  - Keywords / search optimization terms
  - Privacy policy URL (use https://tempo.app/privacy)
  - Support URL and marketing URL
- [ ] **App Store age rating questionnaire** — Complete the age rating questionnaire for both platforms
- [ ] **Set up App Store Connect and Google Play Console** — Configure app metadata, pricing & availability, and in-app purchase/subscription products that match the 3 tiers (Free, Pro $9/mo, Team $19/mo per user)

---

## Marketing

- [ ] **Set up Google Analytics** — Create a Google Analytics 4 property and add the tracking code to the marketing site and app
- [ ] **Configure real social media accounts** — The website footer currently has placeholder links to twitter.com, github.com, and linkedin.com. Create branded accounts and update the links in `artifacts/tempo-marketing/src/components/Footer.tsx`:
  - Twitter/X: Create @tempo or similar handle
  - GitHub: Create a tempo-app organization (if open source plans exist)
  - LinkedIn: Create a Tempo Labs company page
- [ ] **Set up social media profile images and bios** — Use consistent branding across all platforms
- [ ] **Prepare launch content** — Create the following before launch day:
  - Launch announcement blog post
  - Product Hunt launch page
  - Social media launch posts (Twitter thread, LinkedIn post)
  - Email to beta users / waitlist
- [ ] **Set up email marketing** — Choose an email marketing provider (e.g., Loops, Resend, ConvertKit) for newsletters and product updates
- [ ] **Press kit** — Prepare a press kit with logos, screenshots, founder bio, and company description for press outreach
- [ ] **SEO monitoring** — Set up Google Search Console and verify the domain to monitor search performance

---

## Technical

- [ ] **Custom domain setup** — Purchase and configure `tempo.app` (or your chosen domain). Update DNS records to point to your hosting provider
- [ ] **SSL certificate** — Ensure SSL/TLS is configured for the custom domain (most modern hosts handle this automatically)
- [ ] **Transactional email service** — Set up an email provider (e.g., Resend, SendGrid, Postmark) for:
  - Welcome emails
  - Password reset emails
  - Subscription confirmation / receipt emails
  - Notification emails
- [ ] **Configure SPF, DKIM, and DMARC records** — Set up email authentication DNS records to prevent emails from going to spam
- [ ] **Error monitoring** — Set up an error tracking service (e.g., Sentry) for both the web app and mobile app
- [ ] **Uptime monitoring** — Set up uptime monitoring (e.g., Better Uptime, UptimeRobot) with alerting
- [ ] **Database backups** — Verify automated database backup schedule and test restoration process
- [ ] **Update OG image and site URL** — When the custom domain is ready, update the site URL in `artifacts/tempo-marketing/src/components/SEO.tsx` (currently set to `https://tempo.app`) and update `public/sitemap.xml`
- [ ] **Rate limiting and abuse prevention** — Ensure API rate limiting is in place, especially for AI-powered features

---

## Pre-Launch Final Checks

- [ ] All legal pages (Privacy, Terms, Cookies) are live and linked from the footer
- [ ] All footer links work correctly
- [ ] SEO meta tags render correctly (test with [metatags.io](https://metatags.io/) or similar)
- [ ] OpenGraph image displays correctly when shared on social media
- [ ] `robots.txt` and `sitemap.xml` are accessible at the root domain
- [ ] Google Search Console sitemap submission
- [ ] Payment flow works end-to-end for all tiers
- [ ] Email delivery works for all transactional emails
- [ ] App loads correctly on mobile browsers
- [ ] 404 page displays correctly for unknown routes
