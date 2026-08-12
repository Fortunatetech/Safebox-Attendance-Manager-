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

## Office gate QR code (optional)

To require staff to be physically at the office gate to sign in/out, set `GATE_QR_SECRET` in
`.env.local` / Vercel env vars. After tapping Sign In or Sign Out, the kiosk opens the phone's camera
in-page and won't complete the action until it scans a QR code that encodes this exact value.

1. Generate a secret and the matching printable QR image:
   ```
   node scripts/generate-gate-qr.mjs
   ```
   This prints a secret (e.g. `SBX-GATE-008dc9d92f`) and writes `gate-qr.png` in the `web/` folder.
2. Set `GATE_QR_SECRET` in `.env.local` and in Vercel to the printed secret.
3. Print `gate-qr.png` (laminate it if it'll live outdoors) and mount it at the gate.
4. Leave `GATE_QR_SECRET` unset to disable the check entirely — this is the default, so local dev and
   any deployment that hasn't opted in are unaffected.

To rotate the code later (e.g. if the sign is damaged or the code leaks), re-run the script without an
argument to get a brand-new secret + image, update `GATE_QR_SECRET`, and re-print the sign. Re-running
with the existing secret as an argument (`node scripts/generate-gate-qr.mjs SBX-GATE-...`) just
regenerates the image without changing the code.

Notes:
- The scan happens **per action** — signing in and signing out each require a fresh scan at the gate,
  not just loading the page once.
- This replaced an earlier GPS-based geofence (`OFFICE_LAT`/`OFFICE_LNG`/`OFFICE_RADIUS_METERS`), which
  was removed after real-world testing showed phone GPS accuracy (20–50m of drift) wasn't reliable enough
  to distinguish "at the gate" from "at a nearby desk."
- Like any physical code, a photo of the sign could in principle be shared — this is a practical deterrent
  for a small trusted team, not cryptographic security.

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
