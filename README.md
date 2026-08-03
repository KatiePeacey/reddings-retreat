# Reddings Retreat — static site

A static (no database, no server) rebuild of the Reddings Retreat website,
converted from the Oracle APEX app. Everything the old app did with a live
database has a static equivalent here:

| Old (APEX) | New (static) |
|---|---|
| Page content from a database region | Baked directly into `index.html` |
| Enquiry "form" | Already just a `mailto:` link — unchanged |
| Availability calendar (`reddings_ical_pkg`, live DB call) | `data/availability.json`, refreshed every 3 hours by a GitHub Actions workflow that reads the same Airbnb iCal feeds |
| Admin page (page-view analytics) | Removed — see "Analytics" below for a free replacement |
| Admin login | Removed — there's nothing left that needs logging in to edit (see "Updating content") |

## 1. Put this on GitHub

1. Create a GitHub account if you don't have one, and a new repository
   (public repos get free GitHub Pages; a private repo needs GitHub Pro).
2. Upload everything in this folder to the repo, keeping the folder
   structure (`css/`, `js/`, `images/`, `data/`, `scripts/`,
   `.github/workflows/`).
3. Repo **Settings → Pages** → Source: **Deploy from a branch** → Branch:
   **main** (root) → Save.
4. Your site is live at `https://yourusername.github.io/reponame/`.

## 2. Connect reddingsretreat.com (GoDaddy)

1. In GitHub: **Settings → Pages → Custom domain** → enter
   `reddingsretreat.com` → Save. (This writes a `CNAME` file into the repo
   — leave it there.)
2. In GoDaddy DNS for `reddingsretreat.com`, add:
   - Four **A** records (host `@`) pointing at:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** record: host `www` → `yourusername.github.io`
3. Wait for DNS to propagate (up to 24h, usually much faster), then tick
   **Enforce HTTPS** back in GitHub Pages settings once it's available.

## 3. Let the availability calendar update itself

The `.github/workflows/update-availability.yml` workflow is already set
up to run every 3 hours and refresh `data/availability.json` from the
three Airbnb calendars, committing the change automatically. Nothing to
do here — it starts working as soon as the repo exists on GitHub (make
sure Actions are enabled: **Settings → Actions → General → Allow all
actions**).

To refresh it manually at any time: repo → **Actions** tab → "Update
availability" → **Run workflow**.

If an Airbnb listing's iCal link ever changes, update the URL in
`scripts/update-availability.js`.

## 4. Updating content

There's no admin login or CMS anymore — editing content means editing
`index.html` directly (text, FAQ answers, review quotes, etc.) and
`css/style.css` for styling, then committing the change. You can do
this either:

- **Directly on GitHub** — open the file in the repo, click the pencil
  icon, edit, commit. Fine for small text tweaks.
- **Locally** — edit the files, then `git add`, `git commit`, `git push`.
  Better for anything bigger (whole sections, new photos).

To add or swap a photo: drop the file into `images/`, then add or edit
the matching `<img src="images/yourfile.jpg">` in `index.html`.

## 5. Analytics (optional)

The old admin page just showed page-view counts and referrers — nothing
content-editable. If you want that back, the simplest free options are
[Cloudflare Web Analytics](https://www.cloudflare.com/en-gb/web-analytics/)
or [GoatCounter](https://www.goatcounter.com/) — both are a single
`<script>` tag added to `index.html`, no backend needed.
