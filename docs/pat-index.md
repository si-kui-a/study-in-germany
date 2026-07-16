# PAT 快速索引

| ID | 分類 | 一句話摘要 |
|---|---|---|
| PAT-01 | CORE_IMMUTABLE | HashRouter + PKCE OAuth 相容性（`redirectTo` 顯式指定） |
| PAT-02 | CORE_IMMUTABLE | PostgREST 無法 auto-embed auth.users FK → 用 attachProfiles() |
| PAT-03 | RESOLVED | listings_public_read 對本人也套 expires_at > NOW()（Phase R 已修正） |
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
| PAT-60 | CORE_IMMUTABLE | Recommendation 資料契約：無時效性原則，逐項 WebSearch 查證 |
| PAT-61 | CORE_IMMUTABLE | Recommendation 6 子分類拆檔管理 |
| PAT-62 | CORE_IMMUTABLE | Recommendation 沿用 Edu Icon（僅新畫 General/Taiwan） |
| PAT-63 | CORE_IMMUTABLE | Module Color 保守統一策略（避免動態 class 被 purge） |
| PAT-64 | CORE_IMMUTABLE | Recommendation Hub 佈局對齊 Edu |
| PAT-65 | CORE_IMMUTABLE | 6 維評分 DB CHECK 硬限 integer，client-side round 修 500 錯誤 |
| PAT-66 | CORE_IMMUTABLE | Edu 資料來源合併：官方資源→主要資料來源，刪除重複區塊 |
| PAT-67 | CORE_IMMUTABLE | user_submissions 表：4 種提交類型，Lily 手動審核 |
| PAT-68 | DEPRECATE_MARK | PAT-52 GitHub Issues 建議系統（改用 user_submissions form） |
| PAT-69 | CORE_IMMUTABLE | SubmissionForm 通用元件（4 類型共用） |
| PAT-70 | CORE_IMMUTABLE | user_submissions default status 改 approved（即時顯示） |
| PAT-71 | CORE_IMMUTABLE | UserSubmissionsList 通用元件（含已知分類篩選落差） |
| PAT-72 | CORE_IMMUTABLE | listings type 擴為 6 類（含 3 個 discussion 子類） |
| PAT-73 | CORE_IMMUTABLE | Board Hierarchical Filter UI（討論展開次級篩選） |
| PAT-74 | CORE_IMMUTABLE | SubmissionForm target_url 選填連結 |
| PAT-75 | CORE_IMMUTABLE | profiles 擴展：registration_seq + badges |
| PAT-76 | CORE_IMMUTABLE | avatars Storage bucket：公開讀 + 本人寫，5MB 上限 |
| PAT-77 | CORE_IMMUTABLE | display_name 3 種選項（google/anonymous/custom） |
| PAT-78 | CORE_IMMUTABLE | Board contact_info 改為 optional |
| PAT-79 | CORE_IMMUTABLE | useContributions Hook（Phase K-2 徽章判定資料源） |
| PAT-80 | CORE_IMMUTABLE | user_submissions target_category：Recommendation 真分類化 |
| PAT-81 | CORE_IMMUTABLE | 徽章系統：7 個徽章 + 3 級頭框 |
| PAT-82 | CORE_IMMUTABLE | Badge SVG：Edu Geometry 語系（6 新畫 + 1 沿用） |
| PAT-83 | CORE_IMMUTABLE | UserAvatar + BadgeChip 通用元件 |
| PAT-84 | CORE_IMMUTABLE | useBadges Hook：lazy sync 徽章至 profiles.badges |
| PAT-85 | CORE_IMMUTABLE | Cross-cutting Profile 顯示不用 PostgREST embed（同 PAT-02 限制） |
| PAT-86 | CORE_IMMUTABLE | 徽章 vs 頭框關係（多徽章、單頭框） |
| PAT-87 | CORE_IMMUTABLE | schools.json 擴充至 27 所（Batch 1，10 校已核實） |
| PAT-88 | CORE_IMMUTABLE | Header 導覽簡化：更多/我的 hierarchical dropdown |
| PAT-89 | CORE_IMMUTABLE | Mobile 漢堡選單修復（P0，含 HMR 除錯教訓） |
| PAT-90 | CORE_IMMUTABLE | BadgeChip size prop（sm/md/lg） |
| PAT-91 | CORE_IMMUTABLE | Follow 系統：user_follows + 追蹤動態牆 |
| PAT-92 | CORE_IMMUTABLE | 檢舉系統：reports 表，僅 Dashboard 可見 |
| PAT-93 | CORE_IMMUTABLE | 刪除大頭貼：即時 UPDATE avatar_url = null |
| PAT-94 | CORE_IMMUTABLE | 帳號刪除：自助匿名化（非真實刪除 auth.users） |
| PAT-95 | CORE_IMMUTABLE | 帳號軟刪除：7 天寬限期恢復機制（DeletionRestoreBanner） |
| PAT-96 | KNOWN_ISSUE | 刪除頭貼按鈕條件顯示（avatarUrl 有值才顯示，非 bug） |
| PAT-97 | CORE_IMMUTABLE | 匿名顯示名稱格式：User_{9位數字補零} |
| PAT-98 | CORE_IMMUTABLE | 佈告欄按讚系統：listing_likes + LikeButton |
| PAT-99 | CORE_IMMUTABLE | 佈告欄留言系統：listing_comments + CommentSection |
| PAT-100 | KNOWN_ISSUE | Claude Code sandbox 無法完成 OAuth 登入（驗證上限說明） |
| PAT-101 | CORE_IMMUTABLE | 貼文到期機制：商業 90 天／討論永久 + RLS 修正 |
| PAT-102 | CORE_IMMUTABLE | 討論區 8 類（新增美食 + 台灣餐廳） |
| PAT-103 | CORE_IMMUTABLE | 佈告欄租房分類重組：rental_offer/seek 歸為「租房」子類 |
| PAT-104 | CORE_IMMUTABLE | 支持頁面：/support 鎖定 Coming Soon |
| PAT-105 | CORE_IMMUTABLE | 站名更改：留德資訊 → 留德華（8 檔 14 處，公告歷史條目除外） |
| PAT-106 | CORE_IMMUTABLE | 發文 FAB + Modal Pattern（Board.tsx 改浮動按鈕觸發） |
| PAT-107 | CORE_IMMUTABLE | 追蹤動態獨立頁面：/following（抽取自 MyProfile） |
| PAT-108 | CORE_IMMUTABLE | GitHub 帳號改名：lilichen-F → si-kui-a + deploy.yml 修正 |
| PAT-109 | CORE_IMMUTABLE | schools.json Batch 2 匯入（27→52 所，跳過 5 筆重複） |
| PAT-110 | CORE_IMMUTABLE | 隱私政策 GDPR 更新（8 表逐項列出；贊助/服務條款 2 節待補） |
| PAT-111 | CORE_IMMUTABLE | 城市圖示擴充：18 城（400×300 天際線家族，非 60×60 Geometry） |
| PAT-112 | CORE_IMMUTABLE | 錯誤訊息絕不直接渲染（P0，translateError fallback 根因修正） |
| PAT-113 | CORE_IMMUTABLE | Privacy.tsx 第10/11節補完（逐字採用 Lily 提供文件） |
| PAT-114 | CORE_IMMUTABLE | 輕量 IA 優化：FAQ 升一級/推薦併學用/空狀態 CTA |
| PAT-115 | DEPRECATE_MARK | 佈告欄聯絡方式強制化提案已否決（維持 PAT-78 選填） |
| PAT-116 | CORE_IMMUTABLE | Portal 卡片視覺統一：大圖示置中 + 既有 module color 套用 |
| PAT-118 | CORE_IMMUTABLE | Portal 圖示重畫：修正 Phase Y 線稿放大視覺不足問題 |
| PAT-119 | CORE_IMMUTABLE | Portal 色彩統一為 brand-burgundy，脫離 module-* 分歧邏輯 |
| PAT-120 | RESOLVED | module-faq/myposts 灰色根因：非故障，僅低飽和度顏色 |
| PAT-121 | CORE_IMMUTABLE | Portal 圖示造型統一：色塊為主、線條為輔（含共用檔案拆分） |
| PAT-122 | CORE_IMMUTABLE | 全站圖示系統 v2（Phase AH）：改用 Tabler Icons，僅城市天際線家族維持手繪 SVG |
| PAT-123 | CORE_IMMUTABLE | 追蹤動態併入佈告欄：檢視模式（誰）與分類 filter（什麼）為正交維度 |
| PAT-124 | CORE_IMMUTABLE | 站內命名統一：使用者可見文字「學用」→「作戰手冊」，不動程式碼識別名 |
| PAT-125 | RESOLVED | PAT-122 全站圖示稽核：4 家族合規，Recommendation 家族 viewBox 不一致已修正 |
| PAT-126 | CORE_IMMUTABLE | 全站卡片密度優化 v2：響應式雙態 + 圖示/標題放大（手機列表 icon 48px/桌面卡 icon 64-80px） |
| PAT-127 | CORE_IMMUTABLE | 新手導覽系統精簡版：persona_stage 選擇 + Edu Hub 動態突出，跳過期限/推播 |
| PAT-128 | CORE_IMMUTABLE | 階段設定按鈕視覺提升：純文字連結改卡片式按鈕，顯示目前階段 |
| PAT-129 | CORE_IMMUTABLE | 我的貼文/我的評價併入佈告欄（3、4 個 viewMode），MyPosts.tsx 移除 |
| PAT-130 | CORE_IMMUTABLE |「我的」重組為 3 頂層分頁+2 子分類（語校評價/貼文），沿用 hierarchical sub-filter |
| PAT-132 | CORE_IMMUTABLE | FAQ 新增德國安全性+德鐵準點率/失竊資訊（3 題，已查證 2026-07 資料） |
| PAT-133 | CORE_IMMUTABLE | FAQ 年度維護日期：頁底寫死「最後審核於 YYYY-MM」，人工年度更新 |
| PAT-134 | CORE_IMMUTABLE |「下一步提示」卡片：依 persona_stage 導向作戰手冊對應 Step 1，v9 精簡延伸 |
| PAT-135 | RESOLVED | Phase AH deprecated 手繪 SVG 檔案清理（20 檔，健檢確認零引用後刪除） |
| PAT-136 | CORE_IMMUTABLE | FAQ 結論先行排版：summary+points+收合 detail 三層結構，與純文字格式並存 |
| PAT-137 | CORE_IMMUTABLE | 作戰手冊進度追蹤系統：profiles.workflow_progress(JSONB)，勾選+自動推進 |
| PAT-138 | CORE_IMMUTABLE | 推薦專區新增 Wise（跨境匯款，無時效性資訊原則） |
| PAT-139 | RESOLVED | 進度追蹤未同步 bug：改用 Context 單一資料源，消除跨頁 fetch 競態 |
| PAT-140 | CORE_IMMUTABLE | Wise 於作戰手冊 STEP 03（個人銀行帳戶）同步出現，spec 誤植為 STEP 05 |
| PAT-141 | CORE_IMMUTABLE | Header 導覽重構：語校+作戰手冊收合進「資源」dropdown，一級導覽精簡為 3 項 |
| PAT-142 | CORE_IMMUTABLE | 推薦專區更名「加油站」，路由 URL 不變，僅改顯示文字 |
| PAT-143 | CORE_IMMUTABLE | Portal/Recommendation/Edu 卡片描述文字桌面+手機皆顯示（維持 PAT-126 跨頁一致性） |
| PAT-144 | CORE_IMMUTABLE | persona_stage 循序推進：全部完成後「前往下一階段」按鈕，await 雲端寫入避免 PAT-139 重演 |
| PAT-145 | CORE_IMMUTABLE | 推薦專區分類重組：8 新分類（金融/交通/電信/找房/查詢/獎學金/支出/通用）取代舊 6 分類 |
| PAT-146 | CORE_IMMUTABLE | 加油站新增第 9 分類「外事局」，僅收錄柏林/慕尼黑 2 筆已查證連結；已知缺口：schema.sql CHECK constraint 未含 immigration |
| PAT-147 | CORE_IMMUTABLE | 加油站卡片摘要化：description>60 字改用 summary/points/detail（PAT-135 格式），stretched-link 解決 details 巢狀在 a 內的問題 |
| PAT-148 | CORE_IMMUTABLE | 加油站推薦 + 語言學校補 updated_at（YYYY-MM），依 git log 實際 commit 日期核實；修正 spec 誤植的 Phase L→實為 Phase U |
| PAT-149 | CORE_IMMUTABLE | 外事局分類頁新增通用應對指南（5 節+8 官方連結），沿用 WorkflowCard button+chevron 展開模式；發現 AS 未合併與指令書前提衝突，經請示後等待合併再分支 |
| PAT-150 | CORE_IMMUTABLE | 內容層規則：summary/points/detail 結構中 detail 只留獨有資訊，逐句重複刪除，無獨有內容則整欄位省略（非留空字串） |
| PAT-151 | CORE_IMMUTABLE | 外事局指南 §2 擴充 §2a/§2b/§2c（申請要件/Abs.3-4 再入境對照表/送件建議值），事實依 Lily 查證三張表逐字填入，新增 table/callout 區塊型別 |
| PAT-152 | CORE_IMMUTABLE | 加油站卡片格式全站化：summary/points/detail 三層改為全站一律採用，移除正方形/寬卡雙分支，改單一卡片版型+「官網↗」按鈕 |
| PAT-153 | CORE_IMMUTABLE | 外事局指南新增 §4a/§4b（聯絡管道/補件通知）+ §6（eAT/eID）；查證 bamf.de 過程中一併驗證取得原本標記待查的 AusweisApp URL 與 116116 熱線 |
| PAT-154 | CORE_IMMUTABLE | telecom.json 新增 6 個預付卡品牌（Telekom/Vodafone/O2/congstar/Ortel/Lebara），全數瀏覽器驗證存活；分類頁新增身分驗證共通事實橫幅 |
| PAT-155 | CORE_IMMUTABLE | 核心教訓：schema.sql 段落未經真 DB 驗證即視同未測試，Phase AV 建立 audit.sql + expected-schema.md 全量稽核機制取代憑印象比對 |
| PAT-156 | CORE_IMMUTABLE | 全站更名分層規則：只改顯示層字串（導覽/標題/toast/隱私政策），路由/檔名/category鍵值/DB CHECK值域/程式碼註解一律不動 |
| PAT-157 | CORE_IMMUTABLE | 導覽「資源」撞名事故：AW 更名正確但未檢查新名稱與既有 PAT-141 分組標籤衝突；全站更名須額外檢查新名稱是否製造新的視覺重複（與 AX 分支的 PAT-157 待合併後重新編號） |
| PAT-158 | CORE_IMMUTABLE | schema.sql 校正唯一合法依據是 audit.sql 對正式 DB 的真實查詢結果，程式碼推論只能當線索不能當校正依據（起因：AV 用程式碼推論校正 user_id 外鍵，猜錯目標） |
| PAT-159 | CORE_IMMUTABLE | 導覽完成後續彈窗須掛 App 根層級：OnboardingModal 完成時 navigate() 會卸載 Home，狀態需用 window CustomEvent 廣播而非 props/state 耦合 |
| PAT-160 | CORE_IMMUTABLE | 多重觸發路徑功能規則：每條獨立使用者路徑須各自瀏覽器實測，程式碼審閱不可替代任一路徑的實機驗證（起因：略過導覽路徑未實測即宣稱不觸發） |
| PAT-161 | CORE_IMMUTABLE | Phase BA 推翻 AX Path B「略過→永久不再彈」設計：每次造訪皆彈導覽視窗+登入同意提示，直到登入為止；Lily 三輪確認的產品方向調整，非工程失誤，與低摩擦原則有意張力 |
| PAT-162 | CORE_IMMUTABLE | 全站文案準則（Phase BB 建立）+ 判斷框架：「使用者」作內容標籤/第三方署名可留，取代「你」對讀者說話則違規；導覽短詞彙不套用散文結構要求 |
| PAT-163 | CORE_IMMUTABLE | 貼文卡片共用元件（ListingCardBody，line-clamp+展開）+ fetchWithRetry 讀取重試工具（3 次/500ms→1000ms，需 `.retry(false)` 關閉 postgrest-js 內建重試避免疊加）；讀可重試、寫不可重試 |
| PAT-164 | CORE_IMMUTABLE | user_submissions.status 4 值語意（approved≠終態，僅 rejected/archived 才從清單消失）；跨分類共用型別的分類專屬欄位優先選填擴充；篩選元件單選/複選依資料結構決定，非統一套用同一互動 |

## 分類語意
- **CORE_IMMUTABLE**: 動搖此決策會連鎖影響多檔，須整輪重新 governance
- **DEPRECATE_MARK**: 現行決策標記過期候選，需求方裁決後升級或降級
- **KNOWN_ISSUE**: 已知問題，暫不修，記錄以免重複踩
- **RESOLVED**: 原為 KNOWN_ISSUE/DEPRECATE_MARK，已於後續 Phase 實際修正，保留記錄供追溯

## 查找路徑
明細於 Meta_Dev_Knowledge.md，PAT-XX 為錨點。
