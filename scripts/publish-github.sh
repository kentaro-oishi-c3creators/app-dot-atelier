#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo='kentaro-oishi-c3creators/app-dot-atelier'
gh api "repos/$repo" --jq .full_name
npm ci
npm test
npm run build
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/$repo.git"
fi
if ! gh api "repos/$repo/pages" >/dev/null 2>&1; then
  gh api --method POST "repos/$repo/pages" -f build_type=workflow >/dev/null
fi
git -c credential.helper='!gh auth git-credential' push -u origin main
gh api "repos/$repo/pages" --jq .html_url
