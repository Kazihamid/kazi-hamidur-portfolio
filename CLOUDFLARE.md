# Cloudflare portfolio

This version serves the static Next.js export and a small content API from one Cloudflare Worker. Published content lives in D1 and survives code deployments. No Next.js server runs in production.

Live portfolio: https://kazi-hamidur-portfolio.kazihamidur.workers.dev/

Admin: https://kazi-hamidur-portfolio.kazihamidur.workers.dev/setup/

The generated admin password is stored locally in `.env.cloudflare-admin`. Copy only the value after `ADMIN_PASSWORD=` into the sign-in form. This file is excluded from Git.

## Everyday editing

1. Open `/setup/` on your Cloudflare address and sign in with your admin password.
2. Edit profile, projects, experience, or another section.
3. Click **Save & Publish**. A success message confirms the database write.
4. Open **View Portfolio**. New page loads fetch published content; already-open public tabs refresh when you return to them or within one minute.

**Save Draft** is an optional private backup in the current browser. It does not publish. **Reload Live** discards local edits and reads published content. Export JSON before reloading if you want to preserve an older draft. Older drafts from GitHub Pages belong to that separate domain: export them there, then import them on Cloudflare.

The public print resume reads published cloud content. PDF/DOCX downloads are static files and still require a code deployment to replace. Page metadata and initial HTML remain build-time content; browser-visible portfolio content is fetched from D1.

## Automatic deployment from GitHub

Connect the existing `kazi-hamidur-portfolio` Worker under **Settings → Builds → Connect** to the GitHub repository `Kazihamid/kazi-hamidur-portfolio`. Authorize the Cloudflare GitHub App for this repository when prompted.

Use these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm run cloud:build` |
| Deploy command | `npx wrangler deploy` |
| Build variable | `NODE_VERSION=22.14.0` |

Disable builds for non-production branches unless you create a separate preview database. Do not deploy branch previews with the production D1 binding. Do not add `ADMIN_PASSWORD` as a build variable; keep it as the existing Worker secret.

After connecting, start one build from `main` and confirm it succeeds. Thereafter, pushing to `main` or merging a pull request into `main` triggers deployment automatically. Setup's Save & Publish continues to update D1 directly, and code deployments preserve that content.

To check a build, open the Worker's **Deployments** tab and select the latest build to view its status and logs. The banner asking for your first commit means the connection is ready but no build has started yet. A successful production deployment confirms the new code is live.

## Manual installation alternative

Use the Cloudflare Free plan. This project does not enable paid features. Free quotas still apply; Cloudflare may reject requests when quotas are exhausted.

For an automated installation after sign-in, run `npm run cloud:provision`, then `npm run cloud:deploy`. Provisioning reuses the configured database, applies migrations, and stores a generated password in the git-ignored `.env.cloudflare-admin`. After deployment, run `npm run cloud:initialize -- https://your-worker.workers.dev` to populate an empty database through the API and verify publishing protection. This preserves existing cloud content. On a new Cloudflare account, use an interactive terminal and approve registration of the free `workers.dev` subdomain when Wrangler prompts.

The manual alternative is:

```powershell
npm install
npm run cloud:login
npx wrangler d1 create kazi-hamidur-portfolio-content --location apac
```

Copy the database UUID reported by Cloudflare into the `database_id` field in `wrangler.jsonc`. Leave `NEXT_PUBLIC_BASE_PATH` unset for Cloudflare.

```powershell
npm run cloud:migrate
npx wrangler secret put ADMIN_PASSWORD
```

At the password prompt, enter a unique password of at least 16 characters. This is a server-side secret; never use `NEXT_PUBLIC_` for it or commit it. To rotate it, run the same secret command again. Rotation invalidates current sessions.

```powershell
npm run test:cloud
npm run cloud:deploy
```

Wrangler prints your `https://kazi-hamidur-portfolio.<account>.workers.dev` URL. Visit Setup and click **Save & Publish** once to put the initial content in D1. Future code deployments preserve it. The GitHub Pages site remains a separate static site and does not receive cloud saves.

## Local cloud testing

Create a git-ignored `.dev.vars` file containing `ADMIN_PASSWORD="your-local-test-password"` (at least 16 characters), then:

```powershell
npx wrangler d1 migrations apply DB --local
npm run cloud:dev
```

Use the local URL Wrangler prints. `npm run dev` still runs the original repository-backed editor without a cloud API. Local D1 is separate from production.

## Protection and recovery

- Only authenticated API requests can publish; no credentials are shipped to browsers.
- Sessions use signed, HttpOnly, SameSite cookies and expire after eight hours.
- Writes require the same origin; login attempts are limited per IP.
- Content is validated on import and publication.
- Revision checks reject an outdated editor instead of overwriting newer content. Export your edits, reload live content, merge changes, then publish again.
- Export JSON for portable backups. A failed publish keeps edits in the editor; Save Draft or Export JSON before closing it.

The API is intentionally a single-admin content service. Cloudflare ownership and deployments remain controlled by your Cloudflare account.
