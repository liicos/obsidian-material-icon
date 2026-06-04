# Obsidian Material 文件图标

[English](README.md) | **简体中文**

在 Obsidian 文件浏览器中，用 [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme) 图标替换默认图标，按文件扩展名与文件名自动匹配。

<img src="docs/screenshots/file-explorer.png" alt="文件浏览器 Material 图标效果" width="480" />

## 截图

### 文件浏览器

按扩展名与文件名显示图标——画布笔记、Markdown 模板、文件夹等各有专属图标（见文首预览）。

### 设置

可分别开关文件 / 文件夹图标、启用自定义规则，并切换设置界面语言（支持 10 种语言）。

<img src="docs/screenshots/settings.png" alt="设置页" width="480" />

### 自定义规则

为任意扩展名添加规则（不含前导点号），从 Material Icon Theme 图标库中选择图标。开启后，自定义规则优先于默认匹配。

<img src="docs/screenshots/custom-rule.png" alt="添加自定义规则" width="480" />

### 图标选择器

配置自定义规则时可搜索、浏览 500+ 图标。

<img src="docs/screenshots/icon-picker.png" alt="图标选择器" width="480" />

## 功能

- **扩展名匹配** — 最长后缀优先（如 `d.ts` 优于 `ts`）
- **文件名匹配** — 如 `.gitignore`、`Makefile`、`docker-compose.yml`
- **文件夹图标** — 折叠 / 展开两种状态
- **自定义规则** — 按扩展名覆盖图标，带可搜索的图标选择器
- **独立开关** — 可分别启用或关闭文件 / 文件夹图标
- **多语言设置界面** — English、简体中文、繁體中文、日本語、한국어、Deutsch、Français、Español、Русский、Português
- **明暗主题** — 图标随 Obsidian 主题切换

## 安装

### 从 Release 安装（推荐）

1. 从 [Releases](https://github.com/liicos/obsidian-material-icon/releases) 下载：
   - **Zip：** `material-file-icons-x.x.x.zip` — 解压到 `.obsidian/plugins/`
   - **或** 将 `main.js`、`manifest.json`、`styles.css` 放入 `.obsidian/plugins/material-file-icons/`（社区插件安装需要单文件 Release）
3. 在 **设置 → 第三方插件** 中启用 **Material File Icons**

> **从旧版升级？** 插件 id 已改为 `material-file-icons`。若存在 `.obsidian/plugins/obsidian-material-icon/`，请先删除，再安装到 `material-file-icons/` 目录。

### 本地构建

```bash
git clone https://github.com/liicos/obsidian-material-icon.git
cd obsidian-material-icon
npm install
npm run build
cp main.js manifest.json styles.css /你的库路径/.obsidian/plugins/material-file-icons/
```

## 开发

```bash
npm install
npm run dev          # 监听模式（不重新生成图标数据）
npm run build        # 完整生产构建
npm run build-icons  # 仅重新生成 src/icon-data.ts
```

| 路径 | 说明 |
|------|------|
| `src/main.ts` | 插件主逻辑 |
| `scripts/build-icons.mjs` | 从 `material-icon-theme` 提取 SVG，生成 `src/icon-data.ts` |
| `styles.css` | 图标与设置页样式 |

请勿手改 `src/icon-data.ts`。若要添加扩展名映射，请编辑 `scripts/build-icons.mjs` 末尾的自定义块，然后执行 `npm run build-icons`。

`main.js` 与 `src/icon-data.ts` 已加入 `.gitignore`；克隆仓库后需先执行 `npm run build`。

## 图标匹配优先级

1. 自定义规则（开启时）
2. 精确文件名
3. 最长匹配扩展名
4. 默认文件图标

## 致谢

文件图标来源于 [PKief/vscode-material-icon-theme](https://github.com/PKief/vscode-material-icon-theme)（MIT）。

## 许可证

[MIT](LICENSE)
