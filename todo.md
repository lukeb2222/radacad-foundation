# Project TODO

- [x] Database schema (applications, referrals, donations, messages, admin notes)
- [x] Backend tRPC routes for applications (create, list, get, update status, add notes)
- [x] Backend tRPC routes for donations (create via Stripe, list, getTotal)
- [x] Backend tRPC routes for messages (create, list, markRead)
- [x] Stripe integration for donation payments (one-time and recurring)
- [x] Owner notification on new application, donation, or message
- [x] Home page with hero, mission, programs, impact stats, CTA sections
- [x] Apply page with multi-step form (personal info, program, financial need, essay, referrals)
- [x] Donate page with progress bar, tiered giving, custom amount, Stripe checkout
- [x] Message/Contact page with inquiry form
- [x] Admin dashboard - login protected (admin role only)
- [x] Admin dashboard - Applications tab with list view, detail view, status updates, notes
- [x] Admin dashboard - Messages tab
- [x] Admin dashboard - Donations tab with tracking
- [x] Admin dashboard - Notes system with author attribution
- [x] Admin dashboard - AI analysis for submissions
- [x] Automated donation amount tracking (auto-update raised total)
- [x] Bank transfer info note on donate page
- [x] Footer with "This website was made by Webadi" credit
- [x] Responsive design matching Max Martin Scholarships style
- [x] Direct dashboard access at /dashboard (auth-gated, no passcode needed)
- [x] Use actual RadAcad logo in navbar and site branding
- [x] Retheme entire site to match RadAcad/Radical Minds Academy style (angular, no circles/rounded elements)
- [x] Add program overviews from actual RadAcad offerings
- [x] Pull application info from RadAcad website
- [x] Refine Donate page with tiered giving and Stripe checkout
- [x] Refine Apply page with multi-step form and actual RadAcad programs
- [x] Ensure admin dashboard properly reviews applications and shows donations
- [x] Include images from the current Radical Minds Academy website throughout the Foundation site
- [x] Remove "$200K+ Total Funded" stat from home and donate pages
- [x] Add RadAcad online school partners section (Virtual Prep Academy, Aeon School, ICL Academy, Laurel Springs)
- [x] Add scroll-triggered animations (fade-in, slide-up) on public pages (Home, Apply, Donate, Contact)
- [x] Rebuild admin dashboard to match Max Martin structure (themed to RadAcad)
- [x] Add committee password access + access link tokens (dual-access model)
- [x] Add committee member registration (name/email prompt on first login)
- [x] Add committee reviews system (rubric-based scoring, notes, attribution)
- [x] Add committee file uploads (documents tab with PDF upload, categories, text extraction)
- [x] Add AI analysis tab for applications (LLM-powered strengths/weaknesses)
- [x] Add Analytics tab with demographics, submission trends, fundraising settings
- [x] Add Access Links management in Analytics tab
- [x] Add CSV export for applications and donors
- [x] Add auto-refresh every 60 seconds
- [x] Add applicant detail dialog with 5 tabs (Overview, Essays, Documents, Reviews, AI Analysis)
- [x] Theme dashboard to RadAcad teal/green branding (not warm/gold Max Martin colors)
- [x] Rebuild public pages to look exactly like radicalmindsacademy.org (same layout, fonts, colors, animations)
- [x] Remove Employment Status field from the application form
- [x] Fix React hooks error in Apply.tsx (moved useScrollAnimation before conditional return)

## Garrett's Email Changes (June 2026)

### Home Page
- [x] Add secondary headline: "RadAcad Foundation provides need-based and merit-based scholarships to students and families attending Radical Minds Academy."
- [x] Clarify scholarships only apply to RadAcad daytime classes and monthly memberships (NOT summer camps or after-school clubs)
- [x] Fix "Smarter Way to Learn" section: change "daily group activities" to "weekly group activities"

### Application Form - Complete Rebuild
- [x] Split application into two types: Need-Based Scholarship and JHSC Merit Scholarship
- [x] Need-Based: Student info, household financial info, MFI percentage, financial need attestation
- [x] Need-Based: 4 essay questions (Why RadAcad?, RadAcad values, Strengths to community, Goals)
- [x] Need-Based: Parent/Guardian statement, transcript upload, optional recommendation letter
- [x] Merit (JHSC): Student info, division (MS/HS), active JHSC member confirmation
- [x] Merit (JHSC): 4 essay questions (Why RadAcad?, RadAcad Code of Conduct, JHSC values, Goals)
- [x] Merit (JHSC): Parent/Guardian statement (optional), transcript upload, JHSC coach rec letter, optional additional rec
- [x] Word limits: MS 300 words max, HS 600 words max per question

### Donate Page
- [x] Replace banner image (remove Christopher on Jackalope)
- [x] Change fundraising goal to $30,000 by December 31, 2026
- [x] Add ability to manually adjust donation total for offline donations (admin setting via Analytics > Fundraising Settings)
- [x] Change "50 lives changed" to "5 lives changed"
- [x] Change founding year to 2026
- [x] Update one-time giving levels ($50, $145, $490, $1200, $2650, $7000) with descriptions
- [x] Add monthly giving options ($25, $50, $145, $490, $1200, $2650/month) with descriptions
- [x] Add tax receipt note near donation button (501c3 language)
- [x] Delete "Where Your Donation Goes" section
- [x] Use Garrett's Stripe donation link: https://donate.stripe.com/aFafZj5Qg83mckN5rJa3u00

### Committee Portal
- [x] Fix keystroke bug: page flashes/refreshes after each keystroke in Name/Email fields
- [x] Replace generic 0-100 score with rubric-based scoring per scholarship type
- [x] Need-Based rubric: Financial Need, RadAcad Fit, RadAcad Values, Goals & Motivation, Community Contribution, Communication (each 1-5)
- [x] Merit rubric: RadAcad Fit, RadAcad Values, JHSC Values, Academic & Athletic Goals, Communication, Rec. Letters (each 1-5)
- [x] Auto-calculate total score per reviewer and average across reviewers
- [x] Auto-rank applicants by total score
- [x] Committee members can see own scores but not edit others' scores

### Contact Page
- [x] Send contact form submissions directly to garrett.austen@tetontutors.org (via owner notification with full details)

### Hosting/Ownership
- [x] (Info only) Garrett wants to transfer site to his own account for hosting costs - noted for delivery
- [x] Restrict scholarship applications to daytime school programs only (no summer camps or after-school clubs)
- [x] Update home page to clarify scholarships only cover daytime school programs (not summer camps or after-school)
- [x] Remove 3-program grid section from home page (only daytime classes are eligible)

## Resend Email Integration
- [x] Install resend npm package
- [x] Add RESEND_API_KEY secret
- [x] Create email helper (server/email.ts) with thank-you template
- [x] Trigger thank-you email on successful Stripe donation webhook (checkout.session.completed)
- [x] All 15 tests passing including Resend API key validation
