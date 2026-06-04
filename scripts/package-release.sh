#!/usr/bin/env bash
# Build obsidian-material-icon-<version>.zip for GitHub Releases.
set -euo pipefail
cd "$(dirname "$0")/.."

PLUGIN_ID="obsidian-material-icon"
VERSION="$(node -p "require('./manifest.json').version")"
OUT="obsidian-material-icon-${VERSION}.zip"

rm -rf dist
mkdir -p "dist/${PLUGIN_ID}"
cp main.js manifest.json styles.css "dist/${PLUGIN_ID}/"
(cd dist && zip -rq "../${OUT}" "${PLUGIN_ID}")

echo "${OUT}"
