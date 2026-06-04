#!/usr/bin/env bash
# Build plugin artifacts and publish a GitHub Release (requires: gh auth login)
set -euo pipefail
cd "$(dirname "$0")/.."

TAG="${1:-v$(node -p "require('./manifest.json').version")}"

echo "Building..."
npm run build

echo "Publishing release ${TAG}..."
gh release view "$TAG" &>/dev/null && gh release upload "$TAG" main.js manifest.json styles.css --clobber \
  || gh release create "$TAG" main.js manifest.json styles.css --generate-notes

echo "Done: https://github.com/liicos/obsidian-material-icon/releases/tag/${TAG}"
