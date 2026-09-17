# Kazi Hamidur Rahman — Professional Portfolio

A dark Modern Bento personal portfolio and lightweight browser-based portfolio CMS.

## Stack
- Next.js 16 / React 19 / TypeScript
- Static export for GitHub Pages
- JSON-driven content model
- Browser localStorage drafts for `/setup`
- JSON, CSV, Excel-compatible `.xls`, and Print/PDF export

## Local development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Production build
```bash
npm run build
```
Static output is generated in `out/`.

## GitHub Pages
The included GitHub Actions workflow builds the portfolio and deploys `out/` to GitHub Pages.

For a project repository, the workflow automatically sets the repository name as `NEXT_PUBLIC_BASE_PATH`. For a `<username>.github.io` repository it uses the site root.

## Dynamic management model
`/setup` edits a browser draft stored in localStorage. Use **Export JSON** to save the configuration. GitHub Pages itself is static and cannot securely write back to the repository without a separate authenticated service.

A future cloud version can replace the storage adapter with an API/database while keeping the same public UI and setup experience.
