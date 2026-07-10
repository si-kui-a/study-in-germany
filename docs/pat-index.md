# PAT 快速索引

| ID | 分類 | 一句話摘要 |
|---|---|---|
| PAT-01 | CORE_IMMUTABLE | HashRouter + PKCE OAuth 相容性（`redirectTo` 顯式指定） |
| PAT-02 | CORE_IMMUTABLE | PostgREST 無法 auto-embed auth.users FK → 用 attachProfiles() |
| PAT-03 | DEPRECATE_MARK | listings_public_read 對本人也套 expires_at > NOW() |
| PAT-04 | CORE_IMMUTABLE | GH Pages base './' 相對路徑（子路徑 `/study-in-germany/`） |
| PAT-05 | CORE_IMMUTABLE | Build-time env 注入，anon key 進 bundle 是預期 |
| PAT-06 | CORE_IMMUTABLE | ThemeProvider CSS var 驅動主題 |
| PAT-07 | CORE_IMMUTABLE | 評分維度用 JSONB stars 儲存，加維度不改 schema |
| PAT-08 | CORE_IMMUTABLE | listings.type = enum('secondhand','rental_offer','rental_seek') |
| PAT-09 | CORE_IMMUTABLE | 照片：client 壓縮 + Storage RLS 驗 foldername[0] = auth.uid |
| PAT-10 | DEPRECATE_MARK | v2 舊 stars_teaching/environment 欄位（v4 已 DROP） |
| PAT-11 | KNOWN_ISSUE | deletePhoto best-effort，孤兒照片會累積 |
| PAT-12 | KNOWN_ISSUE | tsconfig verbatimModuleSyntax 下需 `import type` |
| PAT-13 | CORE_IMMUTABLE | Tailwind v4 @theme inline 語法（本專案） |
| PAT-14 | CORE_IMMUTABLE | Mock Mode 隔離（VITE_MOCK_MODE=1） |
| PAT-15 | CORE_IMMUTABLE | __APP_VERSION__ build-time 注入 |
| PAT-16 | CORE_IMMUTABLE | 錯誤翻譯層 errorMessages.ts |
| PAT-17 | CORE_IMMUTABLE | DevBadge production 自動剝離（OfflineBanner 為 runtime 保留） |
| PAT-18 | CORE_IMMUTABLE | Vite manualChunks: react-vendor / supabase-vendor |
| PAT-19 | CORE_IMMUTABLE | Hero 天際線 4 城 SVG 橫向拼組（flex-1 min-w-0，opacity 淺/深模式區分） |
| PAT-20 | CORE_IMMUTABLE | SchoolDetail Banner overlay 漸層蓋層（保留 MOCK_MODE fallback） |
| PAT-21 | CORE_IMMUTABLE | PortalCard 4:3 aspect 硬鎖 |
| PAT-22 | CORE_IMMUTABLE | DS v4.1 Morandi 色票 + module 識別色遷移 |
| PAT-23 | CORE_IMMUTABLE | HotSchools 聚合於 client（無 DB 聚合函式/view） |
| PAT-24 | CORE_IMMUTABLE | 全站搜尋純 client substring（search.ts，零新依賴） |
| PAT-25 | KNOWN_ISSUE | /edu 為 Phase B.2 骨架（已於 C.1 展開為 workflow，見 PAT-29） |
| PAT-26 | DEPRECATE_MARK | MD 契約 Vite ?raw import（Phase D 稽核降級，0 實際使用） |
| PAT-27 | CORE_IMMUTABLE | FAQ 與 Edu 資訊層級分工（快速常問 vs 深入流程手冊） |
| PAT-28 | DEPRECATE_MARK | dangerouslySetInnerHTML（C.1 已移除，風險註記保留供未來復活參考） |
| PAT-29 | CORE_IMMUTABLE | Edu Workflow 資料契約（workflow.ts 型別 + 7 主題檔） |
| PAT-30 | CORE_IMMUTABLE | Edu Geometry Icon 系統（viewBox 60×60，REGISTRY 註冊） |
| PAT-31 | DEPRECATE_MARK | markdown.ts 與 .md?raw 宣告（C.1 後無業務使用，保留供未來純文字頁） |
| PAT-32 | CORE_IMMUTABLE | WorkflowCard Accordion 五區固定 pattern |
| PAT-33 | CORE_IMMUTABLE | 台灣繁體用語約束（避免大陸慣用語） |
| PAT-34 | CORE_IMMUTABLE | Exit workflow 完整離境流程（9 step） |
| PAT-35 | CORE_IMMUTABLE | APS 台灣豁免明確化 |
| PAT-36 | CORE_IMMUTABLE | WorkflowStep procedure 支援 nested（string \| { text, items[] }） |
| PAT-37 | CORE_IMMUTABLE | 德文專有名詞首次出現原則 |
| PAT-38 | CORE_IMMUTABLE | 限制提領帳戶用詞統一（不用「封鎖帳戶」） |
| PAT-39 | CORE_IMMUTABLE | 全站德文首次原則（擴展 PAT-37 至全站範圍） |
| PAT-40 | CORE_IMMUTABLE | 全站繁體用語掃描原則 |
| PAT-41 | CORE_IMMUTABLE | theme-color 淺深雙軌（index.html media query） |
| PAT-42 | KNOWN_ISSUE | GH Pages CDN propagation 時序（deploy.yml sleep 90s） |
| PAT-43 | CORE_IMMUTABLE | Dependabot major bump 保守策略（ignore major，minor/patch 照常） |
| PAT-44 | CORE_IMMUTABLE | 6 維評分系統（5 維使用者選填，overall 自動計算） |
| PAT-45 | CORE_IMMUTABLE | RatingBreakdown 兩種 mode（compact 一行 / bar-chart 全維） |
| PAT-46 | DEPRECATE_MARK | StarSlider 半星支援（Phase V 已移除，改整星見 PAT-49） |
| PAT-47 | CORE_IMMUTABLE | Edu 卡片圖案尺寸 w-20 sm:w-24（置中 layout） |
| PAT-48 | KNOWN_ISSUE | 討論區於 UI 端 fake（title「[討論] 」前綴標記，待 Phase W schema migration） |
| PAT-49 | CORE_IMMUTABLE | StarSlider 簡化為 1-5 整星（toggle 清除） |
| PAT-50 | CORE_IMMUTABLE | 語校 accommodation 欄位（string \| null，保守判斷） |
| PAT-51 | CORE_IMMUTABLE | schools.json 擴充至 17 所（WebSearch 逐校查證，不確定一律 null） |
| PAT-52 | CORE_IMMUTABLE | 使用者建議系統：GitHub Issues 整合（零 DB / 零新服務） |
| PAT-53 | CORE_IMMUTABLE | LICENSE 策略：MIT，未來付費功能另存閉源專案 |
| PAT-54 | CORE_IMMUTABLE | Edu WorkflowStep +references[] +updated_at（AST 腳本機械生成） |
| PAT-55 | CORE_IMMUTABLE | Schools 篩選 UI：城市 + 住宿雙 dropdown，SchoolList 改受控元件 |
| PAT-56 | CORE_IMMUTABLE | School 連結雙軌：Google Maps + 官網並列 |
| PAT-57 | CORE_IMMUTABLE | Portal 6 卡佈局：兩列 3+3，新增「推薦」/recommendation placeholder |
| PAT-58 | KNOWN_ISSUE | schools.json URL 死鏈稽核：2 校修正、2 校疑似環境網路限制待覆核 |

## 分類語意
- **CORE_IMMUTABLE**: 動搖此決策會連鎖影響多檔，須整輪重新 governance
- **DEPRECATE_MARK**: 現行決策標記過期候選，需求方裁決後升級或降級
- **KNOWN_ISSUE**: 已知問題，暫不修，記錄以免重複踩

## 查找路徑
明細於 Meta_Dev_Knowledge.md，PAT-XX 為錨點。
