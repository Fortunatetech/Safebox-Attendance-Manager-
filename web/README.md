# Safebox Attendance Manager

A Next.js (App Router) rewrite of the original Streamlit attendance app. Two experiences:

- **Kiosk** (`/`) — public sign-in / sign-out terminal for staff.
- **Admin Console** (`/admin`) — password-protected dashboard: overview metrics, detailed reports with
  CSV/PDF export, employee management, settings, and help.

Visual identity is "Vault Console" — dark graphite surfaces, a single brass accent, and a vault-dial
logomark, styled for a physical-security company's attendance terminal rather than a generic SaaS dashboard.

## Stack

- Next.js 16 (App Router, Turbopack, Server Actions)
- Tailwind CSS v4 (theme tokens in `app/globals.css`)
- `next-auth` v5 (Credentials provider, JWT sessions) for admin auth
- `googleapis` + a Google **service account** for Sheets access (no OAuth consent screen, works headlessly
  on Vercel — the original app's installed-app OAuth flow with `token.pickle` cannot run there)
- Recharts for charts, `jspdf` / `jspdf-autotable` for PDF export

## Local development

```bash
npm install
npm run dev
```

Without any Google Sheets env vars set, the app automatically runs on **in-memory mock data**
(`lib/sheets/mock.ts`) — eight sample employees and ~30 days of attendance history — so you can explore
every screen immediately.

### Admin login (local)

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET` in `.env.local` (see `.env.example`).
Generate a password hash without ever writing the plaintext password anywhere else:

```bash
node scripts/hash-password.mjs "your-password"
```

> **Gotcha:** Next.js expands `$VARIABLE` references in `.env*` files. A bcrypt hash contains `$`, so every
> `$` in `ADMIN_PASSWORD_HASH` must be escaped as `\$` or the value gets silently corrupted and login will
> fail with "Invalid username or password" even with the right password.

## Connecting the real Google Sheet

The original sheet ("SafeBox_Standard_Attendance_Sheet" with "Employee Master Data" and "Attendance Data"
tabs) keeps working — reads/writes are matched by **header name**, not column position, so the sheet's
column order doesn't need to change.

1. In [Google Cloud Console](https://console.cloud.google.com), create a project (or reuse one), enable the
   **Google Sheets API**, and create a **Service Account**.
2. Create a JSON key for that service account and copy its `client_email` and `private_key`.
3. Open your Google Sheet and **share it with the service account's email** (Editor access) — service
   accounts don't have their own Drive, so this step is required.
4. Copy the Sheet ID from its URL: `https://docs.google.com/spreadsheets/d/`**`<THIS_PART>`**`/edit`.
5. Set in `.env.local` (or your Vercel project's environment variables):
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```
   Keep the `\n` sequences in the private key literal (the app un-escapes them at runtime).

Once all three are set, the app reads/writes the live sheet instead of mock data — no code changes needed.

## Office geofencing (optional)

To require staff to be physically at the office to sign in/out (blocks signing in from home or in
transit), set `OFFICE_LAT` and `OFFICE_LNG` in `.env.local` / Vercel env vars. The kiosk then asks the
browser for the device's GPS position on every sign-in/out and rejects the request server-side if it's
further than `OFFICE_RADIUS_METERS` (default 150m) from that point.

1. Get your office's coordinates (e.g. right-click the location in Google Maps → copy the lat/lng shown).
2. Set:
   ```
   OFFICE_LAT=6.5244
   OFFICE_LNG=3.3792
   OFFICE_RADIUS_METERS=150
   ```
3. Leave both blank to disable the check entirely — this is the default, so local dev and any deployment
   that hasn't opted in are unaffected.

Notes:
- This checks the device's **reported GPS location**, not the network it's connected to — it works over
  Wi-Fi or cellular data, and doesn't depend on your office ISP's IP address staying stable (Starlink in
  particular rotates IPs via CGNAT on most plans, which makes IP-based restriction unreliable).
- Employees will get a one-time browser location-permission prompt. If they deny it, sign-in/out is
  blocked with a clear message rather than silently failing.
- GPS accuracy indoors can drift 20–50m, so avoid setting the radius too tight.
- Phones sometimes return a fast, low-accuracy network-based fix instead of waiting for a real GPS lock —
  that alone could misread as "in range" from well outside the office. `OFFICE_MAX_ACCURACY_METERS`
  (default 100) rejects any fix worse than that and asks the user to retry, so a distance check never runs
  against a position that can't be trusted in the first place.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo and set **Root Directory** to `web/` (the Next.js app lives in this
   subfolder; the original Streamlit files stay untouched at the repo root).
3. Add the environment variables above (Google service account + `AUTH_SECRET` / `ADMIN_USERNAME` /
   `ADMIN_PASSWORD_HASH`) in the Vercel project settings.
4. Deploy.

## Project structure

- `lib/sheets/` — data layer: `types.ts` (shared types + header maps), `mock.ts` (fixture), `googleSheets.ts`
  (real Sheets client), `index.ts` (public API used everywhere else; picks mock vs. real automatically).
- `lib/auth.ts` — NextAuth config. `proxy.ts` — route protection for `/admin/**` (Next.js 16 renamed
  `middleware.ts` to `proxy.ts`).
- `app/actions/` — Server Actions for attendance sign-in/out, admin auth, and employee CRUD.
- `app/admin/(dashboard)/` — the protected admin shell and its pages (route group so `/admin/login` doesn't
  get the sidebar).
- `components/ui/` — shared design-system primitives; `components/admin/` and `components/kiosk/` — feature
  components.
