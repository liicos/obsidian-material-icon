# Material File Icons for Obsidian

Replace the default file explorer icons in Obsidian with [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme) icons, matched by file extension and filename.

## Features

- **Extension matching** — longest suffix wins (e.g. `d.ts` before `ts`)
- **Filename matching** — e.g. `.gitignore`, `Makefile`, `docker-compose.yml`
- **Folder icons** — closed / open states
- **Custom rules** — override icons per extension with a searchable icon picker
- **Toggles** — enable or disable file / folder icons independently
- **Settings UI** — English, 简体中文, 繁體中文, 日本語, 한국어, Deutsch, Français, Español, Русский, Português
- **Light & dark** — icons follow Obsidian’s theme

## Installation

### From a release (recommended)

1. Download the latest release: [Releases](https://github.com/liicos/obsidian-material-icon/releases)
2. Extract into your vault: `.obsidian/plugins/obsidian-material-icon/`
3. You should have: `main.js`, `manifest.json`, `styles.css`
4. Enable **Material File Icons** under **Settings → Community plugins**

### Manual build

```bash
git clone https://github.com/liicos/obsidian-material-icon.git
cd obsidian-material-icon
npm install
npm run build
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/obsidian-material-icon/
```

## Development

```bash
npm install
npm run dev      # watch mode (does not regenerate icon data)
npm run build    # full production build
npm run build-icons   # regenerate src/icon-data.ts only
```

| Path | Purpose |
|------|---------|
| `src/main.ts` | Plugin logic |
| `scripts/build-icons.mjs` | Extract SVGs from `material-icon-theme` → `src/icon-data.ts` |
| `styles.css` | Icon and settings styles |

Do **not** edit `src/icon-data.ts` by hand. To add custom extension mappings, edit the custom block at the end of `scripts/build-icons.mjs`, then run `npm run build-icons`.

Built artifacts `main.js` and `src/icon-data.ts` are gitignored; run `npm run build` after cloning.

## Icon matching priority

1. Custom rules (when enabled)
2. Exact filename
3. Longest matching extension
4. Default file icon

## Acknowledgements

File icons are derived from [PKief/vscode-material-icon-theme](https://github.com/PKief/vscode-material-icon-theme) (MIT).

## License

[MIT](LICENSE)
