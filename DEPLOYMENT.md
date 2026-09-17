# Deployment Guide

## 1. Create the GitHub repository
Create a new repository under `Kazihamid`, for example `professional-portfolio`.

## 2. Push this project
```bash
git init
git branch -M main
git add .
git commit -m "Initial professional portfolio MVP"
git remote add origin https://github.com/Kazihamid/professional-portfolio.git
git push -u origin main
```

## 3. Enable GitHub Pages
In the repository open **Settings → Pages** and choose **GitHub Actions** as the source.

The included `.github/workflows/deploy-pages.yml` builds the static Next.js export and publishes it automatically after a push to `main`.

## 4. Later cloud deployment
The UI is intentionally separated from persistence. A later deployment can replace browser/local JSON persistence with authenticated API + PostgreSQL/object storage without rebuilding the public pages.
