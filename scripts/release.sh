#!/usr/bin/env bash
# Build plugin artifacts and publish a GitHub Release (requires: gh auth login)
set -euo pipefail
cd "$(dirname "$0")/.."

TAG="${1:-v$(node -p "require('./manifest.json').version")}"

echo "Building..."
npm run build

echo "Packaging..."
chmod +x scripts/package-release.sh
ZIP="$(./scripts/package-release.sh)"

echo "Publishing release ${TAG}..."
if gh release view "$TAG" &>/dev/null; then
  gh release upload "$TAG" "$ZIP" --clobber
else
  gh release create "$TAG" "$ZIP" --generate-notes
fi

echo "Done: https://github.com/liicos/obsidian-material-icon/releases/tag/${TAG}"
