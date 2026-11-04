<div align="center">

<img src="public/logo.png" width="112" alt="LinkLuxe logo" />

# LinkLuxe

**Elegant short links with custom aliases, QR codes, expiry and private click analytics, synced to your account.**

Next.js · React · TypeScript · Tailwind CSS 4 · Firebase Auth · Firestore · Framer Motion

</div>

LinkLuxe turns long web addresses into short, tidy links you can share anywhere, then shows you how they perform. Sign in with an email and password or with Google and your links, QR codes and analytics follow you to every device, while the service never stores visitor IP addresses.

## Screenshots

### Mobile

| Home | Sign in | Register | Create result |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/mobile-home.png" width="180" /> | <img src="docs/screenshots/mobile-signin.png" width="180" /> | <img src="docs/screenshots/mobile-register.png" width="180" /> | <img src="docs/screenshots/mobile-create-result.png" width="180" /> |

| My links | Analytics | QR code | About |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/mobile-links.png" width="180" /> | <img src="docs/screenshots/mobile-analytics.png" width="180" /> | <img src="docs/screenshots/mobile-qr.png" width="180" /> | <img src="docs/screenshots/mobile-about.png" width="180" /> |

| Signed in | Link expired | Not found | |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/mobile-home-signed-in.png" width="180" /> | <img src="docs/screenshots/mobile-expired.png" width="180" /> | <img src="docs/screenshots/mobile-not-found.png" width="180" /> | |

### Desktop

| | |
| :---: | :---: |
| <img src="docs/screenshots/desktop-home.png" width="420" /> | <img src="docs/screenshots/desktop-signin.png" width="420" /> |
| Home | Sign in |
| <img src="docs/screenshots/desktop-register.png" width="420" /> | <img src="docs/screenshots/desktop-home-signed-in.png" width="420" /> |
| Register | Signed in |
| <img src="docs/screenshots/desktop-create-result.png" width="420" /> | <img src="docs/screenshots/desktop-links.png" width="420" /> |
| Create result | My links |
| <img src="docs/screenshots/desktop-analytics.png" width="420" /> | <img src="docs/screenshots/desktop-qr.png" width="420" /> |
| Link analytics | QR code |
| <img src="docs/screenshots/desktop-about.png" width="420" /> | <img src="docs/screenshots/desktop-expired.png" width="420" /> |
| About | Link expired |
| <img src="docs/screenshots/desktop-not-found.png" width="420" /> | |
| Not found | |

## Features

**Shortening**
- **Live shortener on the home page.** Paste a link, get a short one instantly, with copy, open and QR buttons.
- **Custom aliases.** Choose a memorable name, or get a random 7-character code. Aliases are case-insensitive and reserved words are blocked.
- **Optional expiry.** Never, 1 day, 7 days or 30 days. Expired links show a friendly page instead of redirecting.
- **Smart validation** on both the client and the server: only http and https, a 2048 character limit, automatic https:// and loop protection for links that point back at the app.

**Accounts and management**
- **Email and Google sign-in** with an animated sign-in and register screen, password reset by email and an account menu.
- **Links synced to your account.** Create on your phone, manage on your laptop. Only the owner can list or delete a link.
- **My links page.** Live click counts, copy, open, QR and delete with confirmation.
- **QR codes** generated on your device, downloadable as a PNG.

**Analytics**
- **Click tracking.** Total clicks, last clicked time and a per-day history, with referrer sites and a coarse device split. No IP addresses are stored.
- **Per-link analytics.** A 14-day bar chart drawn in plain SVG, top referrers and a mobile, desktop and bot breakdown, with animated counters that update live.

**Safety**
- **Server-enforced rules.** Firestore security rules validate every link: web URLs only, alias format, reserved words, expiry limits, zeroed counters and ownership.
- **Per-account throttle** on link creation, plus strict security headers: content security policy, frame protection, no-sniff, referrer and permissions policies.
- **Private by default.** Anyone can follow a short link, but only its owner can see analytics or remove it.

**Storage**
- **Firestore**, with every document kept under a dedicated LinkLuxe path and atomic alias uniqueness.

**Design**
- Mobile-first: sticky top bar, bottom tab bar, bottom-sheet panels and safe-area padding on phones, a top navigation layout on desktop.
- A champagne gold, rose gold and copper gradient identity on warm charcoal, with glass cards, smooth motion that respects reduced-motion settings, and an original monogram logo, hero illustration and social preview image.
- Accessible by default: labelled fields, visible focus, keyboard-friendly dialogs and screen-reader chart summaries.
- Installable as an app (PWA manifest and icons).

---

Built by DarkWizardCK
