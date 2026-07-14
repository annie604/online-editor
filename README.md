# DocsFlow - 自託管 Word 線上編輯器 (TinyMCE 7)

DocsFlow 是一個基於 TinyMCE 7 核心建立的自託管 Word 線上編輯器解決方案。此專案專為需要「離線使用」、「自訂模版」、「自託管部署」的企業或個人情境所設計，可直接在瀏覽器中進行 Word 風格的富文本編輯，並將成品儲存至後端伺服器。

當在靜態環境（如 GitHub Pages）中部署時，此專案會自動啟用智慧型降級機制，允許使用者將編輯好的文件直接下載為 HTML 檔案。

## ✨ 功能特色

- **完全自託管 (Self-Hosted)**：TinyMCE 原始碼完全從本地伺服器 (`node_modules`) 載入，不依賴雲端 CDN，免註冊 API 憑證 (API Key)，亦無任何網域未註冊警告。
- **A4 模擬頁面佈局**：提供與真實 Microsoft Word 高度相似的 A4 頁面編輯視覺樣式，隨時可一鍵切換至「全寬度流動編輯」模式。
- **動態範本載入 (Document Templates)**：支援載入預設的 HTML 文件樣板（如進度週報、會議記錄、公文信函），點擊即可一秒帶入格式。
- **智慧儲存與降級存檔**：
  * **伺服器模式**：結合 Express 後端 API，將文件寫入伺服器的本地磁碟中 (`saved_documents/` 目錄)。
  * **靜態網頁模式（GitHub Pages）**：自動偵測環境，當點擊「儲存」時，改為調用瀏覽器 Blob 機制直接將文件下載至使用者本地電腦，保證在靜態平台也具備 100% 編輯與產出能力。
- **精美互動 UI**：配備 Slate 與 Indigo 的現代風格調色盤，支援載入骨架屏 (Skeleton Loading)、微互動特效與客製化 Toast 通知系統。

---

## 📁 專案目錄結構

```text
self-hosted-word-editor/
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 自動部署工作流檔案
├── .env                  # 環境變數設定檔（埠號、主機網址等）
├── .env.example          # 環境變數範本檔
├── .gitignore            # Git 忽略檔案設定
├── package.json          # Node.js 專案依賴與腳本定義
├── server.js             # Express 後端伺服器（API 路由與靜態資源對接）
├── README.md             # 專案指南與部署文件（本檔案）
├── scripts/
│   └── copy-tinymce.js   # TinyMCE 靜態資源同步複製腳本
├── saved_documents/      # 用於儲存使用者存檔的本地目錄（自動產生）
└── public/               # 前端靜態資源目錄
    ├── index.html        # 主網頁入口
    ├── css/
    │   └── style.css     # 網頁 UI 樣式表（Vanilla CSS）
    ├── js/
    │   └── app.js        # 前端核心邏輯（TinyMCE 初始化、範本與儲存整合）
    └── templates/        # 文件範本庫
        ├── templates.json       # 範本設定檔（配置範本名稱與路徑）
        ├── weekly_report.html   # 週報範本
        ├── meeting_minutes.html # 會議記錄範本
        └── formal_letter.html   # 標準公文範本
```

---

## 🚀 快速開始

### 1. 安裝環境依賴

在專案目錄下執行以下指令安裝 Express, Dotenv 與 TinyMCE 依賴：

```bash
# 若您的 PowerShell 執行原則受限，請執行：
npm.cmd install

# 一般命令列或 CMD 請直接執行：
npm install
```
> [!NOTE]
> 在 `npm install` 執行完畢後，系統會透過 `postinstall` 鉤子自動執行 `scripts/copy-tinymce.js`，將 TinyMCE 的核心檔案複製至 `public/tinymce/` 底下，以利前端直接靜態存取。

### 2. 設定環境變數

請複製環境變數範本檔 `.env.example` 並重新命名為 `.env`：

```bash
cp .env.example .env
```

預設環境變數配置如下：

```env
# 伺服器連接埠
PORT=3008
# 執行環境
NODE_ENV=development
# 應用程式網址
APP_URL=http://localhost:3008
```

### 3. 啟動伺服器

我們提供了開發監聽模式與標準啟動模式：

```bash
# 開發模式（變更伺服器代碼自動重啟）
npm.cmd run dev

# 生產/一般啟動模式
npm.cmd start
```

啟動後，開啟瀏覽器並造訪 [http://localhost:3008](http://localhost:3008) 即可開始使用！

---

## 🌐 部署至 GitHub Pages

此專案已整合 GitHub Actions，支援自動化建置並部署至 GitHub Pages：

1. **推送代碼至 GitHub 倉庫**：
   將整個專案代碼推送到您的 GitHub 儲存庫（`main` 或 `master` 分支）。

2. **啟用 GitHub Pages 設定**：
   * 造訪您的 GitHub Repository 頁面。
   * 點選 **Settings** -> **Pages**。
   * 在 **Build and deployment** 下方的 **Source**，選取 **GitHub Actions**。

3. **觸發部署**：
   每次推送代碼至 `main` 分支時，GitHub Actions 會自動啟動工作流：
   * 下載代碼並安裝依賴。
   * 執行 `npm run build` 動態建置 TinyMCE 自託管資產。
   * 將 `public` 資料夾發布到 GitHub Pages 靜態站點上。

4. **靜態環境下的「存檔」表現**：
   部署在 GitHub Pages 時，因為沒有後端 API 可寫入伺服器磁碟，當您編輯完文件並點擊 **「儲存文件」** 時，DocsFlow 會**自動下載文件**為 `[文件標題].html` 檔案到您的電腦上。

---

## 🧪 編輯器功能測試步驟

要驗證編輯器是否完全正常運作，請按照以下三個步驟進行測試：

### 步驟 1：富文本編輯測試 (Edit Test)
1. 造訪編輯器網頁（本機 [http://localhost:3008](http://localhost:3008) 或您的 GitHub Pages 網址）。
2. 預設編輯器會載入歡迎字樣與測試表格。
3. 嘗試在文字區點擊，進行文字修改、輸入。
4. 嘗試使用上方的工具列：將某段字體**加粗**、變更字體大小、或者調整對齊方式。
5. 嘗試在表格內插入新的一列，或修改表格內容。

### 步驟 2：載入範本測試 (Template Test)
1. 觀察左側 Sidebar 的「**文件範本庫**」。
2. 點擊「**專案進度週報**」卡片，觀察編輯器是否立刻變更為週報格式，且頂部的文件名稱自動帶入為 `專案進度週報_新建`。
3. 嘗試點擊「**專案會議記錄**」或「**標準公文信函**」進行切換，確認套用功能暢通。

### 步驟 3：存檔機制測試 (Save / Download Test)
1. 隨便編輯一些內容，或套用一個範本。
2. 在頂部的文件名稱欄位中，輸入自訂名稱（例如：`2026年7月技術週報`）。
3. 點擊右上角「**儲存文件**」按鈕。
   * **在本機伺服器運作時**：右下角會顯示 `儲存成功`，並將檔案存於伺服器的 `saved_documents/` 下。
   * **在 GitHub Pages 上運作時**：右下角會顯示 `已下載備份`，瀏覽器會彈出檔案下載視窗，自動儲存 `.html` 文件。

---

## 🛠️ 如何擴充新範本

若想在編輯器中新增其他類類型，請依照以下步驟：

1. **編寫 HTML 內容**：
   在 `public/templates/` 目錄下建立一個新的 HTML 檔案（例如 `cv_template.html`），將您設計好的 HTML 文件格式寫入。建議樣式都使用 inline-style 以確保 TinyMCE 渲染相容性。

2. **註冊範本**：
   編輯 `public/templates/templates.json`，在陣列中加入您的範本配置（請使用相對路徑）：
   ```json
   {
     "title": "個人履歷範本 (Resume)",
     "description": "簡約專業的個人履歷範本，適合求職使用。",
     "url": "templates/cv_template.html"
   }
   ```
3. **完成**：重新載入網頁，左側範本庫將會自動顯示新卡片，TinyMCE 的內建「插入範本」工具列按鈕也會自動更新！
