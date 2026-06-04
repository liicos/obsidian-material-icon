import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import {
  iconRegistry,
  fileExtensionKeys,
  fileNameKeys,
  defaultFileIconKey,
  folderIconKey,
  folderOpenIconKey,
  type IconSet,
} from './icon-data';

// ── Constants ────────────────────────────────────────────────────────────────

const APPLIED_ATTR = 'data-mfi-applied';
const OBSERVED_ATTR = 'data-mfi-obs';
const ICON_CLASS = 'mfi-icon';
const FOLDER_ICON_CLASS = 'mfi-folder-icon';

// ── i18n ──────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'ru' | 'pt';

const LANG_NAMES: Record<Lang, string> = {
  'en': 'English', 'zh-CN': '简体中文', 'zh-TW': '繁體中文',
  'ja': '日本語', 'ko': '한국어', 'de': 'Deutsch',
  'fr': 'Français', 'es': 'Español', 'ru': 'Русский', 'pt': 'Português',
};

interface Strings {
  language: string; languageDesc: string;
  applyFiles: string; applyFilesDesc: string;
  applyFolders: string; applyFoldersDesc: string;
  customRules: string; customRulesDesc: string;
  noRules: string; addRuleBtn: string; extExists: string;
  edit: string; delete: string;
  pickIcon: string; searchPlaceholder: string;
  addRule: string; editRule: string;
  extLabel: string; extDesc: string;
  iconLabel: string; iconDesc: string;
  notSelected: string; selectIcon: string;
  cancel: string; save: string; confirm: string;
  enterExt: string; selectIconNotice: string;
}

const STRINGS: Record<Lang, Strings> = {
  'en': {
    language: 'Language', languageDesc: 'Interface language',
    applyFiles: 'Apply file icons', applyFilesDesc: 'Show Material icons for files by extension, use theme icons when disabled',
    applyFolders: 'Apply folder icons', applyFoldersDesc: 'Show Material icons for folders, use theme icons when disabled',
    customRules: 'Custom rules', customRulesDesc: 'When enabled, custom rules take priority over default icon matching',
    noRules: 'No rules yet, click the button below to add', addRuleBtn: '+ Add rule', extExists: 'Rule for .{ext} already exists',
    edit: 'Edit', delete: 'Delete',
    pickIcon: 'Select Icon', searchPlaceholder: 'Search icon name...',
    addRule: 'Add Custom Rule', editRule: 'Edit Rule',
    extLabel: 'File Extension', extDesc: 'Without dot, e.g.: vue, rs, myext',
    iconLabel: 'Icon', iconDesc: 'Select from Material Icon Theme library',
    notSelected: 'Not selected', selectIcon: 'Select icon…',
    cancel: 'Cancel', save: 'Save', confirm: 'Confirm',
    enterExt: 'Please enter file extension', selectIconNotice: 'Please select an icon',
  },
  'zh-CN': {
    language: '语言', languageDesc: '界面语言',
    applyFiles: '应用文件图标', applyFilesDesc: '根据扩展名为文件显示 Material 图标，关闭后使用主题自带图标',
    applyFolders: '应用文件夹图标', applyFoldersDesc: '为文件夹显示 Material 图标，关闭后使用主题自带图标',
    customRules: '自定义规则', customRulesDesc: '开启后，自定义规则优先于默认图标匹配',
    noRules: '暂无规则，点击下方按钮添加', addRuleBtn: '+ 添加规则', extExists: '后缀 .{ext} 的规则已存在',
    edit: '编辑', delete: '删除',
    pickIcon: '选择图标', searchPlaceholder: '搜索图标名称...',
    addRule: '添加自定义规则', editRule: '编辑规则',
    extLabel: '文件后缀', extDesc: '不含点号，例如：vue、rs、myext',
    iconLabel: '图标', iconDesc: '从 Material Icon Theme 图标库中选择',
    notSelected: '未选择', selectIcon: '选择图标…',
    cancel: '取消', save: '保存', confirm: '确认',
    enterExt: '请输入文件后缀', selectIconNotice: '请选择图标',
  },
  'zh-TW': {
    language: '語言', languageDesc: '介面語言',
    applyFiles: '套用檔案圖示', applyFilesDesc: '根據副檔名為檔案顯示 Material 圖示，關閉後使用佈景主題圖示',
    applyFolders: '套用資料夾圖示', applyFoldersDesc: '為資料夾顯示 Material 圖示，關閉後使用佈景主題圖示',
    customRules: '自訂規則', customRulesDesc: '啟用後，自訂規則優先於預設圖示匹配',
    noRules: '尚無規則，點擊下方按鈕新增', addRuleBtn: '+ 新增規則', extExists: '副檔名 .{ext} 的規則已存在',
    edit: '編輯', delete: '刪除',
    pickIcon: '選擇圖示', searchPlaceholder: '搜尋圖示名稱...',
    addRule: '新增自訂規則', editRule: '編輯規則',
    extLabel: '副檔名', extDesc: '不含點號，例如：vue、rs、myext',
    iconLabel: '圖示', iconDesc: '從 Material Icon Theme 圖示庫中選擇',
    notSelected: '未選擇', selectIcon: '選擇圖示…',
    cancel: '取消', save: '儲存', confirm: '確認',
    enterExt: '請輸入副檔名', selectIconNotice: '請選擇圖示',
  },
  'ja': {
    language: '言語', languageDesc: 'インターフェース言語',
    applyFiles: 'ファイルアイコンを適用', applyFilesDesc: '拡張子に基づきファイルに Material アイコンを表示、無効時はテーマアイコンを使用',
    applyFolders: 'フォルダーアイコンを適用', applyFoldersDesc: 'フォルダーに Material アイコンを表示、無効時はテーマアイコンを使用',
    customRules: 'カスタムルール', customRulesDesc: '有効にすると、カスタムルールがデフォルトより優先されます',
    noRules: 'ルールがありません。下のボタンで追加', addRuleBtn: '+ ルールを追加', extExists: '.{ext} のルールはすでに存在します',
    edit: '編集', delete: '削除',
    pickIcon: 'アイコンを選択', searchPlaceholder: 'アイコン名を検索...',
    addRule: 'カスタムルールを追加', editRule: 'ルールを編集',
    extLabel: 'ファイル拡張子', extDesc: 'ドットなし、例：vue、rs、myext',
    iconLabel: 'アイコン', iconDesc: 'Material Icon Theme ライブラリから選択',
    notSelected: '未選択', selectIcon: 'アイコンを選択…',
    cancel: 'キャンセル', save: '保存', confirm: '確定',
    enterExt: 'ファイル拡張子を入力してください', selectIconNotice: 'アイコンを選択してください',
  },
  'ko': {
    language: '언어', languageDesc: '인터페이스 언어',
    applyFiles: '파일 아이콘 적용', applyFilesDesc: '확장자에 따라 파일에 Material 아이콘 표시, 비활성화 시 테마 아이콘 사용',
    applyFolders: '폴더 아이콘 적용', applyFoldersDesc: '폴더에 Material 아이콘 표시, 비활성화 시 테마 아이콘 사용',
    customRules: '사용자 정의 규칙', customRulesDesc: '활성화 시 사용자 정의 규칙이 기본 아이콘 매칭보다 우선됩니다',
    noRules: '규칙이 없습니다. 아래 버튼을 클릭하여 추가', addRuleBtn: '+ 규칙 추가', extExists: '.{ext} 규칙이 이미 존재합니다',
    edit: '편집', delete: '삭제',
    pickIcon: '아이콘 선택', searchPlaceholder: '아이콘 이름 검색...',
    addRule: '사용자 정의 규칙 추가', editRule: '규칙 편집',
    extLabel: '파일 확장자', extDesc: '점 없이 입력, 예: vue, rs, myext',
    iconLabel: '아이콘', iconDesc: 'Material Icon Theme 라이브러리에서 선택',
    notSelected: '선택 안 됨', selectIcon: '아이콘 선택…',
    cancel: '취소', save: '저장', confirm: '확인',
    enterExt: '파일 확장자를 입력하세요', selectIconNotice: '아이콘을 선택하세요',
  },
  'de': {
    language: 'Sprache', languageDesc: 'Benutzeroberflächen-Sprache',
    applyFiles: 'Datei-Symbole anwenden', applyFilesDesc: 'Material-Symbole für Dateien nach Endung anzeigen, bei Deaktivierung Theme-Symbole verwenden',
    applyFolders: 'Ordner-Symbole anwenden', applyFoldersDesc: 'Material-Symbole für Ordner anzeigen, bei Deaktivierung Theme-Symbole verwenden',
    customRules: 'Benutzerdefinierte Regeln', customRulesDesc: 'Bei Aktivierung haben benutzerdefinierte Regeln Vorrang vor Standard-Zuordnungen',
    noRules: 'Keine Regeln vorhanden, unten hinzufügen', addRuleBtn: '+ Regel hinzufügen', extExists: 'Regel für .{ext} existiert bereits',
    edit: 'Bearbeiten', delete: 'Löschen',
    pickIcon: 'Symbol auswählen', searchPlaceholder: 'Symbolname suchen...',
    addRule: 'Benutzerdefinierte Regel hinzufügen', editRule: 'Regel bearbeiten',
    extLabel: 'Dateiendung', extDesc: 'Ohne Punkt, z.B.: vue, rs, myext',
    iconLabel: 'Symbol', iconDesc: 'Aus der Material Icon Theme Bibliothek wählen',
    notSelected: 'Nicht ausgewählt', selectIcon: 'Symbol wählen…',
    cancel: 'Abbrechen', save: 'Speichern', confirm: 'Bestätigen',
    enterExt: 'Bitte Dateiendung eingeben', selectIconNotice: 'Bitte ein Symbol auswählen',
  },
  'fr': {
    language: 'Langue', languageDesc: "Langue de l'interface",
    applyFiles: 'Appliquer les icônes de fichiers', applyFilesDesc: "Afficher les icônes Material pour les fichiers selon l'extension, utiliser les icônes du thème si désactivé",
    applyFolders: 'Appliquer les icônes de dossiers', applyFoldersDesc: 'Afficher les icônes Material pour les dossiers, utiliser les icônes du thème si désactivé',
    customRules: 'Règles personnalisées', customRulesDesc: "Si activé, les règles personnalisées ont la priorité sur la correspondance d'icônes par défaut",
    noRules: 'Aucune règle, cliquez ci-dessous pour en ajouter', addRuleBtn: '+ Ajouter une règle', extExists: 'Une règle pour .{ext} existe déjà',
    edit: 'Modifier', delete: 'Supprimer',
    pickIcon: 'Sélectionner une icône', searchPlaceholder: 'Rechercher une icône...',
    addRule: 'Ajouter une règle personnalisée', editRule: 'Modifier la règle',
    extLabel: 'Extension de fichier', extDesc: 'Sans point, ex. : vue, rs, myext',
    iconLabel: 'Icône', iconDesc: 'Sélectionner depuis la bibliothèque Material Icon Theme',
    notSelected: 'Non sélectionné', selectIcon: 'Choisir une icône…',
    cancel: 'Annuler', save: 'Enregistrer', confirm: 'Confirmer',
    enterExt: "Veuillez saisir l'extension de fichier", selectIconNotice: 'Veuillez sélectionner une icône',
  },
  'es': {
    language: 'Idioma', languageDesc: 'Idioma de la interfaz',
    applyFiles: 'Aplicar iconos de archivos', applyFilesDesc: 'Mostrar iconos Material para archivos según extensión, usar iconos del tema si está desactivado',
    applyFolders: 'Aplicar iconos de carpetas', applyFoldersDesc: 'Mostrar iconos Material para carpetas, usar iconos del tema si está desactivado',
    customRules: 'Reglas personalizadas', customRulesDesc: 'Si está activado, las reglas personalizadas tienen prioridad sobre la asignación predeterminada',
    noRules: 'Sin reglas, haga clic abajo para añadir', addRuleBtn: '+ Añadir regla', extExists: 'Ya existe una regla para .{ext}',
    edit: 'Editar', delete: 'Eliminar',
    pickIcon: 'Seleccionar icono', searchPlaceholder: 'Buscar nombre de icono...',
    addRule: 'Añadir regla personalizada', editRule: 'Editar regla',
    extLabel: 'Extensión de archivo', extDesc: 'Sin punto, ej.: vue, rs, myext',
    iconLabel: 'Icono', iconDesc: 'Seleccionar de la biblioteca Material Icon Theme',
    notSelected: 'No seleccionado', selectIcon: 'Seleccionar icono…',
    cancel: 'Cancelar', save: 'Guardar', confirm: 'Confirmar',
    enterExt: 'Por favor ingrese la extensión de archivo', selectIconNotice: 'Por favor seleccione un icono',
  },
  'ru': {
    language: 'Язык', languageDesc: 'Язык интерфейса',
    applyFiles: 'Применить иконки файлов', applyFilesDesc: 'Показывать Material-иконки для файлов по расширению, при отключении использовать иконки темы',
    applyFolders: 'Применить иконки папок', applyFoldersDesc: 'Показывать Material-иконки для папок, при отключении использовать иконки темы',
    customRules: 'Пользовательские правила', customRulesDesc: 'При включении пользовательские правила имеют приоритет над стандартным сопоставлением',
    noRules: 'Правил нет, нажмите кнопку ниже для добавления', addRuleBtn: '+ Добавить правило', extExists: 'Правило для .{ext} уже существует',
    edit: 'Изменить', delete: 'Удалить',
    pickIcon: 'Выбрать иконку', searchPlaceholder: 'Поиск иконки...',
    addRule: 'Добавить правило', editRule: 'Редактировать правило',
    extLabel: 'Расширение файла', extDesc: 'Без точки, например: vue, rs, myext',
    iconLabel: 'Иконка', iconDesc: 'Выбрать из библиотеки Material Icon Theme',
    notSelected: 'Не выбрано', selectIcon: 'Выбрать иконку…',
    cancel: 'Отмена', save: 'Сохранить', confirm: 'Подтвердить',
    enterExt: 'Пожалуйста, введите расширение файла', selectIconNotice: 'Пожалуйста, выберите иконку',
  },
  'pt': {
    language: 'Idioma', languageDesc: 'Idioma da interface',
    applyFiles: 'Aplicar ícones de arquivos', applyFilesDesc: 'Mostrar ícones Material para arquivos por extensão, usar ícones do tema se desativado',
    applyFolders: 'Aplicar ícones de pastas', applyFoldersDesc: 'Mostrar ícones Material para pastas, usar ícones do tema se desativado',
    customRules: 'Regras personalizadas', customRulesDesc: 'Se ativado, regras personalizadas têm prioridade sobre a correspondência padrão',
    noRules: 'Sem regras, clique abaixo para adicionar', addRuleBtn: '+ Adicionar regra', extExists: 'Regra para .{ext} já existe',
    edit: 'Editar', delete: 'Excluir',
    pickIcon: 'Selecionar ícone', searchPlaceholder: 'Pesquisar nome do ícone...',
    addRule: 'Adicionar regra personalizada', editRule: 'Editar regra',
    extLabel: 'Extensão de arquivo', extDesc: 'Sem ponto, ex.: vue, rs, myext',
    iconLabel: 'Ícone', iconDesc: 'Selecionar da biblioteca Material Icon Theme',
    notSelected: 'Não selecionado', selectIcon: 'Selecionar ícone…',
    cancel: 'Cancelar', save: 'Salvar', confirm: 'Confirmar',
    enterExt: 'Por favor insira a extensão do arquivo', selectIconNotice: 'Por favor selecione um ícone',
  },
};

// ── Settings types ────────────────────────────────────────────────────────────

interface CustomRule {
  extension: string; // without leading dot, lowercase
  iconKey: string;   // key in iconRegistry
}

interface MfiSettings {
  applyToFiles: boolean;
  applyToFolders: boolean;
  enableCustomRules: boolean;
  customRules: CustomRule[];
  language: Lang;
}

const DEFAULT_SETTINGS: MfiSettings = {
  applyToFiles: true,
  applyToFolders: true,
  enableCustomRules: false,
  customRules: [],
  language: 'zh-CN',
};

// ── Icon picker modal ─────────────────────────────────────────────────────────

class IconPickerModal extends Modal {
  private isDark: boolean;
  private currentKey: string;
  private t: Strings;
  private onSelect: (key: string) => void;

  constructor(app: App, isDark: boolean, currentKey: string, t: Strings, onSelect: (key: string) => void) {
    super(app);
    this.isDark = isDark;
    this.currentKey = currentKey;
    this.t = t;
    this.onSelect = onSelect;
  }

  onOpen() {
    const { contentEl, t } = this;
    contentEl.addClass('mfi-picker-modal');
    this.titleEl.setText(t.pickIcon);

    const searchInput = contentEl.createEl('input', { cls: 'mfi-picker-search' });
    searchInput.type = 'text';
    searchInput.placeholder = t.searchPlaceholder;

    const grid = contentEl.createDiv({ cls: 'mfi-picker-grid' });
    const allKeys = Object.keys(iconRegistry).sort();

    const render = (q: string) => {
      grid.empty();
      const keys = q ? allKeys.filter(k => k.includes(q)) : allKeys;
      for (const key of keys) {
        const set = iconRegistry[key];
        const svg = this.isDark ? set.dark : set.light;

        const item = grid.createDiv({ cls: 'mfi-picker-item' });
        if (key === this.currentKey) item.addClass('is-active');

        const svgWrap = item.createDiv({ cls: 'mfi-picker-svg' });
        svgWrap.innerHTML = svg;
        svgWrap.querySelector('svg')?.setAttribute('width', '24');
        svgWrap.querySelector('svg')?.setAttribute('height', '24');

        item.createDiv({ text: key, cls: 'mfi-picker-name' });

        item.addEventListener('click', () => {
          this.currentKey = key;
          this.onSelect(key);
          this.close();
        });
      }
    };

    render('');
    searchInput.addEventListener('input', () => render(searchInput.value.toLowerCase().trim()));
    setTimeout(() => searchInput.focus(), 50);
  }

  onClose() {
    this.contentEl.empty();
  }
}

// ── Add rule modal ────────────────────────────────────────────────────────────

class AddRuleModal extends Modal {
  private plugin: MaterialFileIconsPlugin;
  private extension = '';
  private selectedKey = '';
  private previewEl: HTMLElement | null = null;
  private selectedLabelEl: HTMLElement | null = null;
  private onSubmit: (rule: CustomRule) => void;
  private isEditing: boolean;

  constructor(
    app: App,
    plugin: MaterialFileIconsPlugin,
    onSubmit: (rule: CustomRule) => void,
    existing?: CustomRule,
  ) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.isEditing = !!existing;
    if (existing) {
      this.extension = existing.extension;
      this.selectedKey = existing.iconKey;
    }
  }

  onOpen() {
    const { contentEl } = this;
    const t = this.plugin.t;
    this.titleEl.setText(this.isEditing ? t.editRule : t.addRule);

    new Setting(contentEl)
      .setName(t.extLabel)
      .setDesc(t.extDesc)
      .addText(text => {
        text
          .setPlaceholder('vue')
          .setValue(this.extension)
          .onChange(v => {
            this.extension = v.trim().replace(/^\.+/, '').toLowerCase();
          });
        if (this.isEditing) text.setDisabled(true);
      });

    const iconSetting = new Setting(contentEl)
      .setName(t.iconLabel)
      .setDesc(t.iconDesc);

    const previewRow = iconSetting.controlEl.createDiv({ cls: 'mfi-add-rule-preview' });
    this.previewEl = previewRow.createSpan({ cls: 'mfi-add-rule-icon' });
    this.selectedLabelEl = previewRow.createSpan({ cls: 'mfi-add-rule-key', text: t.notSelected });

    if (this.isEditing) this.refreshPreview();

    iconSetting.addButton(btn =>
      btn.setButtonText(t.selectIcon).onClick(() => {
        new IconPickerModal(this.app, this.plugin.isDark, this.selectedKey, t, key => {
          this.selectedKey = key;
          this.refreshPreview();
        }).open();
      })
    );

    new Setting(contentEl)
      .addButton(btn => btn.setButtonText(t.cancel).onClick(() => this.close()))
      .addButton(btn =>
        btn
          .setButtonText(this.isEditing ? t.save : t.confirm)
          .setCta()
          .onClick(() => {
            if (!this.extension) { new Notice(t.enterExt); return; }
            if (!this.selectedKey) { new Notice(t.selectIconNotice); return; }
            this.onSubmit({ extension: this.extension, iconKey: this.selectedKey });
            this.close();
          })
      );
  }

  private refreshPreview() {
    if (!this.previewEl || !this.selectedLabelEl) return;
    const set = iconRegistry[this.selectedKey];
    if (!set) return;
    const svg = this.plugin.isDark ? set.dark : set.light;
    this.previewEl.innerHTML = svg;
    this.previewEl.querySelector('svg')?.setAttribute('width', '20');
    this.previewEl.querySelector('svg')?.setAttribute('height', '20');
    this.selectedLabelEl.textContent = this.selectedKey;
  }

  onClose() {
    this.contentEl.empty();
  }
}

// ── Settings tab ──────────────────────────────────────────────────────────────

class MfiSettingTab extends PluginSettingTab {
  plugin: MaterialFileIconsPlugin;

  constructor(app: App, plugin: MaterialFileIconsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const t = this.plugin.t;
    containerEl.empty();

    // ── Language ──────────────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName(t.language)
      .setDesc(t.languageDesc)
      .addDropdown(drop => {
        for (const [code, name] of Object.entries(LANG_NAMES)) {
          drop.addOption(code, name);
        }
        drop.setValue(this.plugin.settings.language).onChange(async v => {
          this.plugin.settings.language = v as Lang;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    containerEl.createEl('hr');

    // ── Basic toggles ─────────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName(t.applyFiles)
      .setDesc(t.applyFilesDesc)
      .addToggle(tog =>
        tog.setValue(this.plugin.settings.applyToFiles).onChange(async v => {
          this.plugin.settings.applyToFiles = v;
          await this.plugin.saveSettings();
          this.plugin.resetAndRefresh();
        })
      );

    new Setting(containerEl)
      .setName(t.applyFolders)
      .setDesc(t.applyFoldersDesc)
      .addToggle(tog =>
        tog.setValue(this.plugin.settings.applyToFolders).onChange(async v => {
          this.plugin.settings.applyToFolders = v;
          await this.plugin.saveSettings();
          this.plugin.resetAndRefresh();
        })
      );

    containerEl.createEl('hr');

    // ── Custom rules ──────────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName(t.customRules)
      .setDesc(t.customRulesDesc)
      .addToggle(tog =>
        tog.setValue(this.plugin.settings.enableCustomRules).onChange(async v => {
          this.plugin.settings.enableCustomRules = v;
          await this.plugin.saveSettings();
          this.display();
          this.plugin.resetAndRefresh();
        })
      );

    if (!this.plugin.settings.enableCustomRules) return;

    const { customRules } = this.plugin.settings;

    if (customRules.length > 0) {
      const listEl = containerEl.createDiv({ cls: 'mfi-rules-list' });

      customRules.forEach((rule, idx) => {
        const row = listEl.createDiv({ cls: 'mfi-rule-row' });

        const iconWrap = row.createSpan({ cls: 'mfi-rule-icon' });
        const set = iconRegistry[rule.iconKey];
        if (set) {
          const svg = this.plugin.isDark ? set.dark : set.light;
          iconWrap.innerHTML = svg;
          iconWrap.querySelector('svg')?.setAttribute('width', '18');
          iconWrap.querySelector('svg')?.setAttribute('height', '18');
        }

        row.createSpan({ cls: 'mfi-rule-ext', text: `.${rule.extension}` });
        row.createSpan({ cls: 'mfi-rule-key', text: rule.iconKey });

        const edit = row.createEl('button', { cls: 'mfi-rule-edit', text: t.edit });
        edit.addEventListener('click', () => {
          new AddRuleModal(this.app, this.plugin, async updated => {
            this.plugin.settings.customRules[idx] = updated;
            await this.plugin.saveSettings();
            this.display();
            this.plugin.resetAndRefresh();
          }, rule).open();
        });

        const del = row.createEl('button', { cls: 'mfi-rule-del', text: t.delete });
        del.addEventListener('click', async () => {
          this.plugin.settings.customRules.splice(idx, 1);
          await this.plugin.saveSettings();
          this.display();
          this.plugin.resetAndRefresh();
        });
      });
    } else {
      containerEl.createEl('p', { text: t.noRules, cls: 'mfi-rules-empty' });
    }

    const addBtn = containerEl.createEl('button', { cls: 'mfi-add-btn', text: t.addRuleBtn });
    addBtn.addEventListener('click', () => {
      new AddRuleModal(this.app, this.plugin, async rule => {
        const exists = customRules.some(r => r.extension === rule.extension);
        if (exists) {
          new Notice(t.extExists.replace('{ext}', rule.extension));
          return;
        }
        this.plugin.settings.customRules.push(rule);
        await this.plugin.saveSettings();
        this.display();
        this.plugin.resetAndRefresh();
      }).open();
    });
  }
}

// ── Main plugin ───────────────────────────────────────────────────────────────

export default class MaterialFileIconsPlugin extends Plugin {
  settings: MfiSettings = { ...DEFAULT_SETTINGS };

  get t(): Strings { return STRINGS[this.settings.language] ?? STRINGS['zh-CN']; }

  private containerEl: HTMLElement | null = null;
  private containerObserver: MutationObserver | null = null;
  private folderObservers = new Map<HTMLElement, MutationObserver>();
  private themeObserver: MutationObserver | null = null;
  private refreshTimer: number | null = null;
  isDark = false;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new MfiSettingTab(this.app, this));

    this.isDark = document.body.hasClass('theme-dark');
    this.app.workspace.iterateAllLeaves(leaf => this.manageLeaf(leaf));

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.app.workspace.iterateAllLeaves(leaf => this.manageLeaf(leaf));
      })
    );

    this.registerEvent(this.app.vault.on('create', () => this.scheduleRefresh(50)));
    this.registerEvent(this.app.vault.on('rename', () => this.scheduleRefresh(50)));

    this.themeObserver = new MutationObserver(() => {
      const nowDark = document.body.hasClass('theme-dark');
      if (nowDark !== this.isDark) {
        this.isDark = nowDark;
        this.resetAllIcons();
        this.refreshIcons();
      }
    });
    this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    this.register(() => this.themeObserver?.disconnect());
  }

  onunload() {
    this.clearContainerObserver();
    this.themeObserver?.disconnect();
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer);
    this.resetAllIcons();
  }

  // ── Leaf management ─────────────────────────────────────────────────────────

  private manageLeaf(leaf: WorkspaceLeaf) {
    if (leaf.getViewState().type !== 'file-explorer') return;

    const newContainer = (leaf.view as any).containerEl?.querySelector(
      ':scope .nav-files-container > div'
    ) as HTMLElement | null;

    if (!newContainer || newContainer === this.containerEl) return;

    this.clearContainerObserver();
    this.containerEl = newContainer;

    this.containerObserver = new MutationObserver(mutations => {
      let needsRefresh = false;
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-path') {
          needsRefresh = true; break;
        }
        if (m.type === 'childList') {
          for (const node of Array.from(m.addedNodes)) {
            if (node instanceof HTMLElement && node.classList.contains('tree-item')) {
              needsRefresh = true; break;
            }
          }
        }
        if (needsRefresh) break;
      }
      if (needsRefresh) this.scheduleRefresh(0);
    });

    this.containerObserver.observe(newContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-path'],
    });

    this.refreshIcons();
  }

  private clearContainerObserver() {
    this.containerObserver?.disconnect();
    this.containerObserver = null;
    this.folderObservers.forEach(obs => obs.disconnect());
    this.folderObservers.clear();
    this.containerEl = null;
  }

  // ── Refresh scheduling ──────────────────────────────────────────────────────

  private scheduleRefresh(delayMs = 0) {
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.refreshIcons();
    }, delayMs);
  }

  // ── Icon rendering ──────────────────────────────────────────────────────────

  private refreshIcons() {
    if (!this.containerEl) return;
    this.containerEl
      .querySelectorAll<HTMLElement>(':scope > .tree-item')
      .forEach(item => this.processItem(item));
  }

  private processItem(itemEl: HTMLElement) {
    const isFolder = itemEl.classList.contains('nav-folder');
    const titleEl = itemEl.querySelector<HTMLElement>(':scope > .tree-item-self');
    if (!titleEl) return;

    if (!titleEl.hasAttribute(APPLIED_ATTR)) {
      if (isFolder) {
        this.injectFolderIcon(titleEl, itemEl.classList.contains('is-collapsed'));
      } else {
        const path = titleEl.dataset.path ?? '';
        const filename = path.split('/').pop() ?? '';
        this.injectFileIcon(titleEl, filename);
      }
    }

    if (isFolder) {
      if (!itemEl.hasAttribute(OBSERVED_ATTR)) {
        itemEl.setAttribute(OBSERVED_ATTR, '1');
        this.observeFolder(itemEl);
      }
      if (!itemEl.classList.contains('is-collapsed')) {
        itemEl
          .querySelectorAll<HTMLElement>(':scope > .tree-item-children > .tree-item')
          .forEach(child => this.processItem(child));
      }
    }
  }

  private observeFolder(folderEl: HTMLElement) {
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.attributeName !== 'class' || !(m.target instanceof HTMLElement)) continue;
        const wasCollapsed = (m.oldValue ?? '').includes('is-collapsed');
        const isCollapsed = folderEl.classList.contains('is-collapsed');
        if (wasCollapsed === isCollapsed) continue;

        const titleEl = folderEl.querySelector<HTMLElement>(':scope > .tree-item-self');
        if (titleEl) this.updateFolderIcon(titleEl, isCollapsed);
        if (!isCollapsed) this.scheduleRefresh(30);
      }
    });
    obs.observe(folderEl, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    });
    this.folderObservers.set(folderEl, obs);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private getIconSet(key: string): IconSet {
    return iconRegistry[key] ?? iconRegistry[defaultFileIconKey] ?? { dark: '', light: '' };
  }

  private getSvg(iconSet: IconSet): string {
    return this.isDark ? iconSet.dark : iconSet.light;
  }

  private getFileIconSvg(filename: string): string {
    const lower = filename.toLowerCase();

    // 0. Custom rules (highest priority)
    if (this.settings.enableCustomRules && this.settings.customRules.length > 0) {
      const parts = lower.split('.');
      for (let i = 1; i < parts.length; i++) {
        const ext = parts.slice(i).join('.');
        const rule = this.settings.customRules.find(r => r.extension === ext);
        if (rule) return this.getSvg(this.getIconSet(rule.iconKey));
      }
    }

    // 1. Exact filename match
    const nameKey = fileNameKeys[lower];
    if (nameKey) return this.getSvg(this.getIconSet(nameKey));

    // 2. Extension match — longest suffix first
    const parts = lower.split('.');
    for (let i = 1; i < parts.length; i++) {
      const ext = parts.slice(i).join('.');
      const extKey = fileExtensionKeys[ext];
      if (extKey) return this.getSvg(this.getIconSet(extKey));
    }

    return this.getSvg(this.getIconSet(defaultFileIconKey));
  }

  private injectFileIcon(titleEl: HTMLElement, filename: string) {
    if (!this.settings.applyToFiles) return;
    if (titleEl.hasAttribute(APPLIED_ATTR)) return;
    titleEl.setAttribute(APPLIED_ATTR, '1');

    const contentEl = titleEl.querySelector('.nav-file-title-content');
    if (!contentEl) return;
    titleEl.insertBefore(this.makeSvgSpan(this.getFileIconSvg(filename), ICON_CLASS), contentEl);
  }

  private injectFolderIcon(titleEl: HTMLElement, collapsed: boolean) {
    if (!this.settings.applyToFolders) return;
    if (titleEl.hasAttribute(APPLIED_ATTR)) return;
    titleEl.setAttribute(APPLIED_ATTR, '1');

    const contentEl = titleEl.querySelector('.nav-folder-title-content');
    if (!contentEl) return;

    const key = collapsed ? folderIconKey : folderOpenIconKey;
    titleEl.insertBefore(
      this.makeSvgSpan(this.getSvg(this.getIconSet(key)), `${ICON_CLASS} ${FOLDER_ICON_CLASS}`),
      contentEl
    );
  }

  private updateFolderIcon(titleEl: HTMLElement, collapsed: boolean) {
    const span = titleEl.querySelector<HTMLElement>(`.${FOLDER_ICON_CLASS}`);
    if (!span) return;
    const key = collapsed ? folderIconKey : folderOpenIconKey;
    span.innerHTML = this.getSvg(this.getIconSet(key));
    const svgEl = span.querySelector('svg');
    if (svgEl) { svgEl.setAttribute('width', '16'); svgEl.setAttribute('height', '16'); }
  }

  private makeSvgSpan(svg: string, className: string): HTMLElement {
    const span = document.createElement('span');
    span.className = className;
    span.innerHTML = svg;
    const svgEl = span.querySelector('svg');
    if (svgEl) { svgEl.setAttribute('width', '16'); svgEl.setAttribute('height', '16'); }
    return span;
  }

  private resetAllIcons() {
    document.querySelectorAll(`[${APPLIED_ATTR}]`).forEach(el => el.removeAttribute(APPLIED_ATTR));
    document.querySelectorAll(`[${OBSERVED_ATTR}]`).forEach(el => el.removeAttribute(OBSERVED_ATTR));
    document.querySelectorAll(`.${ICON_CLASS}`).forEach(el => el.remove());
    this.folderObservers.forEach(obs => obs.disconnect());
    this.folderObservers.clear();
  }

  resetAndRefresh() {
    this.resetAllIcons();
    this.refreshIcons();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
