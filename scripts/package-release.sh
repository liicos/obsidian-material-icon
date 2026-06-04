#!/usr/bin/env bash
# Build material-file-icons-<version>.zip for GitHub Releases.
set -euo pipefail
cd "$(dirname "$0")/.."

PLUGIN_ID="material-file-icons"
VERSION="$(node -p "require('./manifest.json').version")"
OUT="material-file-icons-${VERSION}.zip"

rm -rf dist
mkdir -p "dist/${PLUGIN_ID}"
cp main.js manifest.json styles.css "dist/${PLUGIN_ID}/"
(cd dist && zip -rq "../${OUT}" "${PLUGIN_ID}")

echo "${OUT}"
