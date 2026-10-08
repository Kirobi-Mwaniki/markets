# Kasi Markets

Kenya's live market wire. A real-time headline feed for Kenyan traders and investors, covering the NSE, the shilling, T-bills and bonds, CBK policy, tea, coffee, fuel and M-Pesa, in English and Kiswahili.

- **Live site** (`/`): new headlines appear within seconds of an editor posting them, with no refresh. It has desk filters, search, a "market-moving only" filter, a Breaking strip, voice read-out, a price ticker and watchlist, today's economic calendar in EAT with a countdown, T-bill auction results, WhatsApp sharing, an EN/SW switch, light and dark themes, and an RSS feed (`/rss.xml`).
- **Newsroom** (`/newsroom`): sign in to post, edit and delete headlines, update prices, manage the calendar and publish actual figures, and publish T-bill results. Admins also manage the team (add, promote, reset passwords, remove) and have content tools.

The site comes loaded with realistic starter content (headlines, NSE prices, a calendar and T-bill results) so it looks like a working wire from the first visit.

---

## Host it on Netlify (for the presentation)

Netlify runs the pages as a static site and the newsroom API as a **Netlify Function**. Content is saved in **Netlify Blobs**, which every Netlify site has built in, so there is no database to set up.

> Netlify's drag-and-drop deploy only publishes plain pages, not functions, so the newsroom would not work. Use option A or B below.

### Option A: from GitHub (recommended, re-deploys itself when you push changes)

1. **Put the code on GitHub.** Create a new private repository (e.g. `kasi-markets`), then upload the contents of this folder. On github.com, **Add file → Upload files** and drag everything in. Leave out `node_modules` and `data` if they exist.
2. **Create the site.** Sign in at https://app.netlify.com, then **Add new project → Import an existing project → GitHub**, and pick the repository.
3. **Build settings.** Netlify reads `netlify.toml` and fills these in for you. Check that they say:
   - Base directory: *(empty)*
   - Build command: `echo 'No build step needed'`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
4. **Add the admin account before the first deploy.** Open **Environment variables** (on the import screen, or later under *Project configuration → Environment variables*) and add:

   | Key | Value |
   |---|---|
   | `ADMIN_EMAIL` | the email you'll sign in with, e.g. `you@yourdomain.co.ke` |
   | `ADMIN_PASSWORD` | a strong password (12+ characters) |
   | `SESSION_SECRET` | *(optional)* any long random string, e.g. from a password generator |

   Make sure the variables are available to **Functions** (the default "All scopes" is fine).
5. Click **Deploy**. After a minute or so you get an address like `https://kasi-markets-xyz.netlify.app`.
6. **Rename the address** (optional): *Project configuration → General → Change project name*, e.g. `kasimarkets` → `https://kasimarkets.netlify.app`.

### Option B: from your laptop with the Netlify CLI

```
npm install -g netlify-cli
cd kasi-markets
npm install
netlify login
netlify init                      # create a new site, accept the settings from netlify.toml
netlify env:set ADMIN_EMAIL you@yourdomain.co.ke
netlify env:set ADMIN_PASSWORD "a-strong-password"
netlify deploy --prod
```

### After deploying: check it works

1. Open `https://<your-site>.netlify.app`. You should see the headlines, ticker and calendar.
2. Open `https://<your-site>.netlify.app/newsroom` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Post a test headline. Within about 4 seconds it appears on the live site in another tab. Delete it afterwards.

The first admin is created on the first visit, using the email and password you set. If you forgot to set them, the sign-in page says so: add the variables, then **Deploys → Trigger deploy → Deploy project**.

Optional full check of the live site from your laptop. It runs about 80 checks, creates and removes a test editor, and finishes by resetting content to the starter set:

```
BASE=https://<your-site>.netlify.app ADMIN_EMAIL=you@yourdomain.co.ke ADMIN_PASSWORD="your-password" npm test
```

(Windows PowerShell: `$env:BASE="https://..."; $env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."; npm test`)

### Use your own domain

*Domain management → Add a domain*, enter e.g. `kasimarkets.co.ke` (bought from any KENIC-accredited registrar), and follow Netlify's DNS instructions. HTTPS is set up automatically.

---

## Presentation checklist

**The same day, before the meeting**
1. Newsroom → **Settings → Reset to starter content**. This moves every headline time, the calendar and the T-bill auction to today, so the site looks current. Do it on the day; starter headlines are timed "a few minutes ago" from the moment you click.
2. Add the client's editors under **Team** if they'll try it, or keep one spare editor account for a live demo.
3. Open the live site on the projector and the newsroom on your laptop or phone.

**A good walkthrough (about 10 minutes)**
1. **The wire:** scroll the feed, filter by desk (e.g. *CBK & Policy*), tap **Market-moving only**, search "Safaricom".
2. **Speed:** in the newsroom, type a headline, tick **Market-moving**, press **Ctrl + Enter**. Within seconds it lands at the top of the live site, flashes, and takes over the Breaking strip.
3. **Kiswahili:** switch the live site to **SW**. Headlines, desks, calendar and labels all change.
4. **Voice:** turn on **Voice** on the live site and post another headline; it is read aloud (like a trading-floor squawk).
5. **Prices:** in **Prices**, type a new Safaricom price and press Enter. The ticker, watchlist and sparkline update.
6. **Calendar:** in **Calendar**, enter an "Actual" figure. It appears green if it beats the forecast and red if it misses.
7. **Sharing:** tap **WhatsApp** on a headline.
8. **Control:** show **Team** (editors vs admins, password reset signs someone out instantly) and the phone view.

**Before real launch:** Settings → **Clear all content**, then start publishing for real.

---

## Run it on your own computer

1. Install Node.js 18 or newer from https://nodejs.org.
2. Open a terminal in this folder and run `npm start`.
3. The first admin email and password are printed in the terminal. Open http://localhost:3000 and http://localhost:3000/newsroom.

To choose the password: `ADMIN_PASSWORD=your-password npm start` (PowerShell: `$env:ADMIN_PASSWORD="your-password"; npm start`).
To wipe everything and start over: `npm run reset`, then `npm start`.
To run the tests: `npm test`.

Locally, content is saved to `data/kasi-db.json`. On Netlify it is saved in Netlify Blobs. The two are separate.

## Settings

Set these as environment variables (on Netlify: *Project configuration → Environment variables*, then redeploy):

| Variable | Default | What it does |
|---|---|---|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | – | First admin account, created on first visit when no accounts exist. Required on Netlify. |
| `SESSION_SECRET` | auto-generated | Signs sign-in cookies. Changing it signs everyone out. |
| `SITE_NAME` | Kasi Markets | Brand name everywhere |
| `SITE_TAGLINE` / `SITE_TAGLINE_SW` | Kenya's live market wire | Tagline in English / Kiswahili |
| `POLL_MS` | 4000 | How often open pages check for news, in milliseconds |

## How it is built

```
public/                    live site and newsroom (plain HTML, CSS, JavaScript)
netlify/functions/api.mjs  the API on Netlify (also serves /rss.xml)
server.js                  the API + pages on your own computer or server
lib/core.js                all API logic, shared by both
lib/storage.js             saving: Netlify Blobs on Netlify, a JSON file elsewhere
lib/auth.js                password hashing (scrypt), signed cookies, sign-in throttling
lib/seed.js                starter content
lib/config.js              brand and settings
netlify.toml               Netlify build settings and security headers
test/                      automated tests
```

**Security:** passwords are hashed with scrypt, and sign-in cookies are signed, HttpOnly and SameSite=Strict. Repeated wrong passwords are throttled. There are editor and admin roles, and the team always keeps at least one admin. Changing or resetting a password signs that person out on other devices, and removing someone signs them out immediately. The site has a strict Content-Security-Policy and escapes all text people type.

## Limits of this version

This is a presentation and pilot build.

- **Live updates use polling.** Each open page checks for news every 4 seconds, which is fine for a presentation and a pilot. For a public launch with thousands of readers, move to a server with push updates (e.g. WebSockets) or a real-time service. Polling also uses Netlify function calls, so watch the usage page if many people keep the site open.
- **Storage** is one Netlify Blobs record, which is fine for a newsroom of a few editors and thousands of headlines. For production, move to PostgreSQL (e.g. Neon or Supabase); only `lib/storage.js` needs to change.
- **Prices are typed in by editors.** Live NSE prices need a data licence from the NSE (dataservices@nse.co.ke) or an authorised vendor; CBK publishes official KES rates daily.
- **Compliance:** register with the Office of the Data Protection Commissioner before collecting reader sign-ups, and keep content to news rather than buy/sell advice unless licensed by the CMA.

## Suggested next enhancements

1. Licensed NSE price feed (delayed 15 min) and automatic CBK exchange rates
2. Reader accounts and a **Pro** plan paid with M-Pesa (Safaricom Daraja STK Push)
3. WhatsApp Channel / Telegram bot that posts market-moving headlines automatically
4. Push notifications and an installable mobile app
5. Price and economic-data alerts for Pro users
6. Company pages for each NSE stock: announcements, results, dividends
7. Newsroom analytics: reads, shares, top headlines
