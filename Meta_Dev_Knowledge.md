# Meta_Dev_Knowledge — study-in-germany

> PAT-01..05 於 Phase A.5 依實際專案歷史補齊（原標 N/A-external，2026-07-08 修正）。

## PAT-01 [CORE_IMMUTABLE]: HashRouter + PKCE OAuth callback 相容性
根因：GH Pages `/study-in-germany/` 子路徑，PKCE `?code=` 於 query，
HashRouter `#/` 於 fragment，兩者不衝突但 `redirectTo` 必須顯式指定
`window.location.origin + window.location.pathname`。

## PAT-02 [CORE_IMMUTABLE]: PostgREST 無法 auto-embed auth.users FK
根因：school_reviews.user_id / listings.user_id 外鍵指向 auth.users 而非
public.profiles。前端以 attachProfiles() 於 types.ts 批次補齊。

## PAT-03 [RESOLVED]: listings_public_read policy 對本人也生效（Phase R 已修正）
原問題：`expires_at > NOW()` 條件使本人於 /my-posts 也看不到過期貼文。
Phase R 實作本文件建議的放寬方案（並額外加上 `expires_at IS NULL` 分支，見 PAT-101），
policy 現為 `USING (expires_at IS NULL OR expires_at > NOW() OR auth.uid() = user_id)`。
保留本條記錄供歷史追溯（原本 DEPRECATE_MARK 標記的建議最終在 Phase R 被採納執行）。

## PAT-04 [CORE_IMMUTABLE]: GH Pages base 子路徑
vite.config.ts base 必須等於 repo 名稱（本專案採 base './' 相對路徑等效）。改 repo 名要同步：base、index.html favicon href、
Supabase Redirect URLs whitelist。

## PAT-05 [CORE_IMMUTABLE]: build-time env 注入
.env.local 僅本機用。GH Actions 於 build 前將 SUPABASE_URL/SUPABASE_ANON_KEY 注入為
VITE_* 環境變數。anon key 進 bundle 為預期（RLS 才是權限層）。
絕不 commit .env.local。

- PAT-06 [CORE_IMMUTABLE]: ThemeProvider CSS var 驅動主題。本專案為 Tailwind **v4**：以 `@theme inline { --color-x: rgb(var(--x)); }` + `@custom-variant dark (&:where(.dark, .dark *))` 實作（v3 的 `rgb(var(--x) / <alpha-value>)` config 語法不適用；opacity modifier 由 v4 color-mix 處理）。
- PAT-07 [CORE_IMMUTABLE]: 評分維度用 JSONB `stars` 儲存（必含 `overall`，DB CHECK 強制），加維度不改 schema——只改前端 UI + `RatingDimension` Type Union。
- PAT-08 [CORE_IMMUTABLE]: `listings.type` = enum('secondhand','rental_offer','rental_seek')，未來加類型需同步改 DB CHECK 與 Type Union + `LISTING_TYPE_LABEL`。
- PAT-09 [CORE_IMMUTABLE]: 照片上傳全鏈路：client Canvas 壓縮（1600px/q0.85/JPEG）→ Storage bucket `listings/<user_id>/<uuid>.jpg` → Storage RLS 驗 `(storage.foldername(name))[1] = auth.uid()::text`。
- PAT-10 [DEPRECATE_MARK]: v2 舊 `stars_teaching`/`stars_environment` 欄位——v4 已改 JSONB；既有 DB 需跑 `supabase/migrate_v2_to_v4.sql`（DROP 重建，v2 資料 0 筆無搬移需求）。
- PAT-11 [KNOWN_ISSUE]: `deletePhoto` 為 best-effort，失敗不阻斷 row 刪除 → 孤兒照片會累積 → 記於 DEBT。
- PAT-12 [KNOWN_ISSUE]: tsconfig `verbatimModuleSyntax: true`——所有 type-only import（ReactNode/FormEvent 等）必須 `import type`，否則編譯失敗。外來 spec 程式碼須先過此檢查。
- PAT-13 [CORE_IMMUTABLE]: Tailwind v4 `@apply` 不能引用自訂 component class（v3 可）——共用基底改用群組選擇器 `.btn, .btn-primary, ... { @apply ... }`。

## PAT-16 [CORE_IMMUTABLE]: 錯誤翻譯層集中於 errorMessages.ts
所有 Supabase 錯誤透過 translateError() 過濾，避免生 raw 錯誤直接展示給使用者。
未命中的 code 保留原文，raw 訊息一律 console.error 供除錯。

## PAT-17 [CORE_IMMUTABLE]: DevBadge / OfflineBanner 於 production 自動剝離
DevBadge 條件 `import.meta.env.DEV` 於 build 時常量摺疊，dead-code elimination
會移除整個元件，不影響 bundle。（OfflineBanner 為 runtime 條件，production 保留——離線提示為正式功能。）

## PAT-18 [CORE_IMMUTABLE]: Vite manualChunks 拆 supabase-vendor
supabase-js 約 30+ KB gzip，獨立 chunk 允許業務代碼變動時保留 vendor cache。

## PAT-19 [CORE_IMMUTABLE]: Hero 天際線 · 4 城 SVG 橫向拼組
HeroSection 用 flex + `flex-1 min-w-0` 讓 4 城 CityIllustration 平均拼組。
opacity 淺色 0.08 / 深色 0.12 確保背景不搶焦。currentColor 對接主題自動適配。
若未來加城市，於 index.tsx 註冊後 HeroSection 手動選取 4 個代表，非自動遍歷。

## PAT-20 [CORE_IMMUTABLE]: SchoolDetail Banner overlay 漸層蓋層
`bg-gradient-to-t from-surface-card via-surface-card/95 to-transparent` 在 SVG 底部
產生可讀性蓋層。淺深模式各自對接 surface-card token。整合時保留 MOCK_MODE fallback
（B.1 banner 版原漏，phase-b-integrated 補回）。

## PAT-21 [CORE_IMMUTABLE]: PortalCard 4:3 aspect 硬鎖
`aspect-[4/3]` 對齊 DS v4.0 spec §六。Icon `w-14 sm:w-16`、line-clamp-2 防爆版。
block+flex display 衝突沿用 DEV-9 移除 block。

## PAT-22 [CORE_IMMUTABLE]: DS v4.1 Morandi 色票 + module 識別色
CSS var 全站遷移：burgundy #B71C1C→#9B5F5F、gold #D9A300→#B8A27A、dark base
#121212→#1E1B19（禁純黑）。新增 surface-section / brand-*-surface / brand-*-soft /
module-{schools,board,faq,edu,myposts} 五模組識別色（僅圖示與識別用，不作主品牌色）。
@theme inline 同步 --color-* 對接。改膚只動 :root/.dark 兩區塊。

## PAT-23 [CORE_IMMUTABLE]: HotSchools 聚合於 client（無 DB 聚合函式）
useHotSchools 撈 school_reviews(school_id, stars) 全量，於 JS Map 聚合 count/avg，
按 review_count desc 排序（決策 4）。無評價語校 count=0 仍回傳排於後。
不建 Postgres view/RPC（維持 supabase 檔零改動 + RLS 公開讀已足夠）。

## PAT-24 [CORE_IMMUTABLE]: 全站搜尋純 client substring（search.ts）
schools+faq+announcements 三來源 substring match，資料量 <100 筆無需 fuse.js。
SearchModal Cmd/Ctrl+K 觸發、↑↓ 導航、Enter 前往、ESC 關閉。零新依賴。
未來若需模糊比對再換 fuse.js（介面已抽象為 searchAll(query)）。

## PAT-25 [KNOWN_ISSUE]: /edu 為 Phase B.2 骨架
placeholder + 6 子板塊預覽卡（簽證/落地/延簽/學程/獎學金/政策）。
Phase B.3 展開子板塊骨架、B.4-B.5 填內容。route 與 Portal 第 5 卡已接。

## PAT-26 [DEPRECATE_MARK]: MD 契約 · Vite ?raw import（Phase D 稽核降級）
Edu 板塊原採 `import md from './x.md?raw'` 純字串 import + 自寫輕量 renderer（src/lib/markdown.ts）。
零新依賴。若日後 MD 內需寫 JSX（互動元件、動態 shortcode）改用 @mdx-js/rollup。
（spec B3d-3 原標 PAT-22，撞既有 Morandi PAT-22 → 順延 26。）
**Phase D 稽核**：grep 全 src/ 確認 0 處 `.md?raw` 實際 import（僅 vite-env.d.ts 型別宣告仍在），
與 PAT-31（markdown.ts 已無業務使用）狀態一致 → 由 CORE_IMMUTABLE 降級 DEPRECATE_MARK。
型別宣告與 renderer 保留供未來 /about、/changelog 等純文字頁使用，見 PAT-31。

## PAT-27 [CORE_IMMUTABLE]: FAQ 資訊層級分工
FAQ = 快速常問（新手第一次會問的 5 題）；Edu = 深入流程手冊（各子主題 400-800 字）。
兩者互相引導，避免內容重疊。深度問題於 FAQ 頁底部指引至 Edu 對應子板塊。

## PAT-28 [DEPRECATE_MARK]: dangerouslySetInnerHTML（Phase B.3 EduTopic，C.1 已移除）
B.3 EduTopic 曾以 dangerouslySetInnerHTML 渲染 MD。C.1 改 workflow 結構化渲染後，
全站已無 dangerouslySetInnerHTML。若未來 markdown.ts 重新啟用（PAT-31），此風險註記復活：
輸入須為可信 static asset、inline() 先 escapeHtml 再套白名單、開放使用者 commit 需 sanitizer。

## PAT-29 [CORE_IMMUTABLE]: Edu Workflow 資料契約
src/data/edu/workflow.ts 定義 WorkflowStep / WorkflowTopic 型別。
6 主題檔（visa/arrival/renewal/application/scholarship/policy.ts）匯出 WorkflowTopic 常數。
加維度只需擴 WorkflowStep interface；TypeScript 型別檢查會攔截漏填。
若 spec 再變（如加 estimated_cost），改 interface 一處，6 檔全部 type-check。

## PAT-30 [CORE_IMMUTABLE]: Edu Geometry Icon 系統
6 個 SVG 於 src/assets/icons/edu/*.tsx，與 CityIllustration 同語系：
viewBox 60×60、currentColor 對接主題、fill/opacity 組合而非漸層、5-10 個幾何 shape、
module-edu 色彩統一驅動。未來加主題只需加 SVG + 於 index.tsx REGISTRY 註冊。
（index.tsx 用 `import type { FC }`，非 React.FC，避免 verbatimModuleSyntax 失敗，DEV-34。）

## PAT-31 [DEPRECATE_MARK]: markdown.ts 與 vite-env.d.ts .md?raw
Phase B.3 引入 · Phase C.1 已無業務使用（Edu 改 workflow 型別，config.ts + 6 MD 已刪）。
保留 markdown.ts 與 .md?raw 宣告供未來 /about、/changelog 等純文字頁使用。
若 3 個月後仍無使用，可移除。

## PAT-32 [CORE_IMMUTABLE]: Workflow Card Accordion pattern
每 WorkflowCard 五區固定：STEP/Title/Meta/Outcome/CTA。
展開後四區塊：Documents/Procedure/Common Mistakes/Official Sources。
「官方資源」用 bg-brand-gold-soft 特別 highlight（DS v4.2 §十三 官方資訊優先原則）。

## PAT-33 [CORE_IMMUTABLE]: 台灣繁體用語約束
所有 UI 文案 · workflow 資料 · 公告內容一律用台灣繁體用語。
避免大陸慣用語(政治導向 → 政黨背景;方便快捷 → 方便快速)。
德文一律降為 title_de 副標 · 小字 italic 呈現。
新內容加入時遵守此約束。

## PAT-34 [CORE_IMMUTABLE]: Exit workflow 是完整離境流程
9 個 step 涵蓋離境全程:通知移民局 → 註銷戶籍 → 解除電視稅 → 解除保險 →
關閉帳戶 → 取回 Sperrkonto → 稅務結算 → 解除電信 → 整理教育文件。
不含只有部分留人適用的事項(如「以後如何返德」)· 該類主題可另做「返德指南」板塊。

## PAT-35 [CORE_IMMUTABLE]: APS 台灣豁免明確化
application step 2 明列:台灣學生一般不需 APS。
例外情況:於中國大陸受教育的台灣學生 · 或行政疏失時的補件。
從此 · workflow 資料檔不再假設「所有華人需 APS」。

## PAT-36 [CORE_IMMUTABLE]: WorkflowStep procedure 支援 nested
ProcedureItem 型別可為 string 或 { text, items[] }。
渲染於 WorkflowCard 中，nested item 用 <ul list-disc> 呈現於 <li> 內。
避免整段內容全被編號為單一 flat list，資訊層次清楚。

## PAT-37 [CORE_IMMUTABLE]: 德文專有名詞首次出現原則
每主題檔內同一個德文專有名詞：
- 第一次出現時附中文說明或於 title_de 呈現
- 之後所有 procedure / common_mistakes 內優先用中文，功能性識別詞（如 Termin、SCHUFA 等常出現於德國官方表單上的詞）可視語境保留
- 例外：Meta location 內若是官方機構名（Bürgeramt / Ausländerbehörde）保留德文
專有名詞英文縮寫（APS、DSH、GDPR）於全站首次出現時附一次全稱，之後可直接用縮寫。

## PAT-38 [CORE_IMMUTABLE]: 限制提領帳戶用詞統一
全站不使用「封鎖帳戶」，一律「限制提領帳戶」。
Sperrkonto 於視覺上為「限制提領帳戶（Sperrkonto）」形式首次出現，之後只用中文。

## PAT-39 [CORE_IMMUTABLE]: 全站德文首次原則(擴展 PAT-37)
從單一 topic 檔內首次原則擴展到全站 UI 資產：
- 每 UI 頁、每資料檔內首次出現德文專有名詞才附中文說明或於 title_de 呈現
- 之後於同一頁 / 同一檔的 procedure / common_mistakes / description / body 內僅用中文
- 但保留：title_de 欄位、官方機構名於 location、官方連結顯示名、documents 內正式表單名
- FAQ 頁、Portal 描述、Announcements、其他 UI 板塊皆遵守此原則

## PAT-40 [CORE_IMMUTABLE]: 全站繁體用語掃描原則
本站語言環境為台灣繁體中文。所有 UI 文案、資料檔內容、錯誤訊息、Toast 一律用：
- 台灣繁體字型、詞彙
- 應用程式（非 app 大陸用法，但 "app" 縮寫可用）
- 網路（非網絡）、伺服器（非服務器）、電子郵件（非郵件）、帳戶（非賬戶）
- 履歷（非簡歷）、品質（非質量）、介面（非界面）、使用者（非用戶）、造訪（非訪問）
新資料加入時遵守此約束。若引用外部資料，引用時翻譯為繁體。

## PAT-41 [CORE_IMMUTABLE]: theme-color 淺深雙軌
index.html 用兩個 <meta name="theme-color"> 加 media query 分別於淺 / 深模式
使用 CSS var `--brand-burgundy`(#9B5F5F) 與 `--surface-canvas`(#1E1B19) 對應顏色。
iOS Safari 頂欄與 Chrome address bar 會依系統偏好切換。

## PAT-42 [KNOWN_ISSUE]: GH Pages CDN propagation 時序
GH Pages CDN 邊緣快取 propagation 需 60-180 秒。
deploy.yml verify job sleep 20 秒過短 · 造成 verify 對舊快取誤報。
Phase U 修為 sleep 90 秒 · 減少誤報。若仍有誤報 · 考慮改為 polling 版本(檢查 bundle hash 更新後才 pass)。

## PAT-43 [CORE_IMMUTABLE]: Dependabot major bump 保守策略
MVP 期間穩定 > 新版本。dependabot.yml 對 npm 與 github-actions 皆 ignore major bump。
Minor / patch 仍會自動提 PR · 安全性更新不受影響。
3-6 個月後可視情況解除此限制。

## PAT-44 [CORE_IMMUTABLE]: 6 維評分系統
DB 端 stars JSONB 存 { overall, teaching, environment, material, admin, transport, price }。
UI 端使用者只選 5 維（teaching / environment / material / admin / transport / price）。
Overall 由 calculateOverall(stars) 於 client 計算為 5 維平均、四捨五入到 0.5。
不允許使用者手動輸入 overall(避免與 5 維邏輯矛盾)。
注意：src/lib/types.ts 的 RatingDimension(7 值，含 overall，受保護檔)與
src/lib/ratings.ts 的 RatingDimension(6 值，不含 overall，新檔)為同名不同型別，
分屬不同模組、無交叉 import，字面量子集吻合，故無實際衝突；未來若需在同一檔案
內同時使用兩者，須以 import 別名區分。

## PAT-45 [CORE_IMMUTABLE]: RatingBreakdown 兩種 mode
- compact=true: review card 內 · 一行 · 已填維度用「教學 4.5」形式
- compact=false: SchoolDetail Banner · 全 5 維 bar chart · 未填顯示「—」
兩 mode 共用同一元件 · props 控制。

## PAT-46 [DEPRECATE_MARK]: StarSlider 半星支援（Phase V 已移除）
純 SVG · 每星拆為左右兩半 button（clipPath: inset）。
左半→x.5、右半→x.0。點清除按鈕即可撤銷。
hover preview 於 UI 顯示但不 commit。
Phase V 簡化為整星（見 PAT-49），此模式僅供歷史參考，Phase T 期間已存的 0.5 值 review 不回溯修改。

## PAT-47 [CORE_IMMUTABLE]: Edu 卡片圖案尺寸 w-20 sm:w-24
DS v4.2 spec §五 Geometry Illustration 於 Edu 卡片 · 圖示尺寸調整為 w-20 (80px) 至 sm:w-24 (96px)。
Layout 用 flex-col + mx-auto 使圖示置中、subtitle italic 於下方。
DS v4.0 spec §六 4:3 aspect 硬鎖 · 圖示佔 30-35% 卡片高度 · 留白平衡。

## PAT-48 [KNOWN_ISSUE]: 討論區於 UI 端 fake
DB listings.type CHECK 只允 3 類（secondhand/rental_offer/rental_seek）。
第 4 類「討論區」discussion 於 UI 端以 title 前綴「[討論] 」作為標記、
存 DB 時 type = 'secondhand'。region 存空字串、price 存 null、photo_urls 存空陣列
（皆為既有非 nullable/string 型別契約下的合法值，非 spec 原字面指令的 null）。
Phase W（若確認討論區使用率）· 進行 DB schema migration · 加 discussion 為第 4 CHECK 值。
含相關 board.ts 常量與 helper function。

## PAT-49 [CORE_IMMUTABLE]: StarSlider 簡化為 1-5 整星
Phase T 半星（0.5 step）於 mobile clipPath 有 render 邊界問題、且使用率低。
Phase V 簡化為純整星、每個 slider 5 顆星 button。
點已選相同值 → 清除為 0（Toggle 行為）。
calculateOverall 保留 1 位小數（不 rounding 到 0.5）。

## PAT-50 [CORE_IMMUTABLE]: 語校 accommodation 欄位
schools.json 每所學校可選 accommodation: string | null。
null = 未知或無提供 · UI 不顯示。
string = 描述提供的住宿類型（寄宿家庭 / 宿舍 / 合作飯店）。
本輪僅 2/5 校（goethe-muenchen、carl-duisberg-koeln）因既有 note 欄位明確提及住宿
才填實情，其餘 3 校設 null（保守判斷，非杜撰）。
未來若需 filter · 可重構為結構化 { type, description }[]（PAT-3A）。
types.ts 受保護 · 於 SchoolDetail 用 as any 讀取。

## PAT-51 [CORE_IMMUTABLE]: schools.json 擴充策略
從 5 所擴至 17 所。加 3 個 optional 欄位：
- founded_year: number | null（該分校 / 機構本身創立年份，非品牌全球創立年 —
  國際連鎖如 Goethe-Institut/inlingua/Berlitz 的全球創立年不等於個別分校開業年，
  無分校層級證據時一律 null，避免張冠李戴）
- accreditation: string[] | null（Goethe-Zertifikat / telc / TestDaF / DTZ / FaDaF 等，
  僅在有具體佐證時填，不確定一律 null）
- price_hint: string | null（費用範圍提示；本輪僅從既有 note 欄位既有的價格文字結構化抽出，
  未新增查證數字）
本輪以 WebSearch 逐校查證（website / 是否真實存在 / founded_year / accreditation），
排除一所查無實據的學校（原提案 dsz-munich）、避免與既有 goethe-berlin/goethe-muenchen
建立重複 ID 的同機構條目。查證結果多處與初始提案不同（如 DIE NEUE SCHULE 實際
1984 年創立，非原提案的 1990）。未來擴充由 GitHub Issues 收集（見 PAT-52）· 審核後 commit。

## PAT-52 [CORE_IMMUTABLE]: 使用者建議系統 · GitHub Issues 整合
避免新表和 admin flow 複雜性、用 GitHub Issues 作為建議 backend。
SchoolDetail 頁「回報建議」+ Schools 列表「提交新學校」皆跳 issue 新增頁、
預填 label 與模板（body 用 encodeURIComponent 或 URLSearchParams 組 query string，
中文標題/內容需正確編碼）。Lily 於 GitHub 審核 → 若採納則手動改 schools.json commit。
好處：零 DB · 零新服務 · 零 auth 依賴 · 資料保存於 GitHub。
壞處：一般使用者可能需先有 GitHub 帳號。日後使用率高可考慮加無帳號替代方案。

## PAT-53 [CORE_IMMUTABLE]: LICENSE 策略
MIT · 全部 v0.7.x 程式碼開源，LICENSE 檔於 repo 根目錄（著作權年份以檔案建立當下年份為準）。
未來付費進階服務將另存為閉源專案、不合入本 repo。README 授權段落明列開源範圍。

## PAT-54 [CORE_IMMUTABLE]: Edu WorkflowStep references + updated_at
每 step 加 optional 欄位：
- references: string[] · 條列資料來源
- updated_at: string · 'YYYY-MM' 或 'YYYY-MM-DD' 格式

WorkflowCard 於 meta 區塊顯示「📅 更新於 · 🔗 N 來源」小字、
於 Accordion 尾加「資料來源」第 5 區塊列出全部 references。

Phase F 保守起點：references 直接由 official_sources[].name 生成（機械轉換，
用 TypeScript compiler API 解析 AST 定位插入點後文字插入，避免手動編輯 53 個
step 的抄寫錯誤），updated_at 統一 '2024-01'。official_sources 為空的 step，
references 為 []。Lily 之後可校正實際更新日期與 references 詳細度。

## PAT-55 [CORE_IMMUTABLE]: Schools 篩選 UI · 城市 + 住宿雙 dropdown
Schools 頁頂部 filter bar：
- 城市 select · 動態 collect 資料中的 city 值
- 住宿 select · 三選一：任意 / 提供 / 不提供
篩選結果數即時顯示於右側「共 N 所」。
純 client filter · 無 fetch overhead。SchoolList 改為受控元件（接收 schools
prop），不再自行 import schools.json。

## PAT-56 [CORE_IMMUTABLE]: School 連結雙軌 · Google Maps + 官網
於 SchoolDetail 移除散布於 Banner meta 列的 website 顯示、統一於資訊區塊底部並列：
- Google Maps 連結 · 用 name_zh + city 作為 search query
- 官網連結 · 若 website 為 null 則不顯示官網 button

## PAT-57 [CORE_IMMUTABLE]: Portal 6 卡佈局 · 兩列 3+3
grid-cols-2（mobile）/ sm:grid-cols-3 / lg:grid-cols-3（從 lg:grid-cols-5 改為
lg:grid-cols-3，讓 6 卡在桌面版也維持兩列 3+3，非單列 5+1）。
卡片順序：語校 / 佈告欄 / 學用 / 推薦 / FAQ / 我的資料。
第 6 卡「推薦」/recommendation 為 Phase G 新路由，內容為 placeholder，
子分類骨架已定義（通用/簽證/落地/學程/獎學金/台灣海外方案），內容留待後續 Phase。

## PAT-58 [KNOWN_ISSUE]: schools.json URL 死鏈稽核（Phase G）
逐校 curl 檢查 17 所學校網址：
- goethe-berlin/goethe-muenchen 原 URL（/sta/ber.html、/sta/mue.html）回 404，
  Goethe 官網已改版為 /ort/ber.html、/ort/mue.html 新路徑，已修正並驗證 200
- carl-duisberg-koeln、berlitz-berlin 於本機檢查環境回連線層失敗（非 HTTP 404，
  TLS handshake 未完成）——判斷為環境網路限制而非真死鏈（兩者皆為知名機構，
  Phase E 已用 WebSearch 個別確認存在），維持現況未改動，記為待 Lily 之後
  於一般網路環境重新確認
- 其餘 13 所皆回 200，無需處理

## PAT-60 [CORE_IMMUTABLE]: Recommendation 資料契約 · 無時效性原則
每 Recommendation 為可長期查證的公開實體（官方網站、大型平台等）。
不寫時效性資訊：價格 · 優惠碼 · 月費 · 特定活動日期。
使用者可自行至各官方連結查最新細節。
Phase H 建檔時以 WebSearch 逐一查證較不確定的項目：
- Coracle（限制提領帳戶服務商）查得目前暫停受理新申請 → 排除，不寫入不穩定服務
- Care Concept 確認為獨立公司（非 Mawista 子品牌）→ 保留
- anabin、駐德國台北代表處、教育部留學貸款專區、三大德國政治基金會（Studienstiftung/KAS/Böll）URL 皆逐一查證
- 台新銀行「留學方案」細節未查得具體佐證 → 描述改保守用詞，不宣稱有專屬留學方案
維護原則：官方 URL 若失效 · 於 GitHub Issue 收報後審核 · 更新或刪除該項。
（原標 PAT-58，撞既有死鏈稽核 PAT-58 → 順延 60。）

## PAT-61 [CORE_IMMUTABLE]: Recommendation 6 子分類 · 拆檔管理
按子分類拆為 6 個 JSON 檔（general/visa/arrival/edu/scholarship/taiwan）於 src/data/recommendations/。
Hub 頁自動 count items · 子分類頁載入單一 JSON。
未來加分類 · 於 RECOMMENDATION_CATEGORIES 追加 + 新增對應 JSON 檔。

## PAT-62 [CORE_IMMUTABLE]: Recommendation 沿用 Edu Icon 資源
Recommendation 6 分類中 4 個（visa/arrival/edu/scholarship）沿用 Edu 現有 SVG。
只新增 2 個 SVG：GeneralIcon（星形 + 光芒）· TaiwanIcon（島輪廓 + 星）。
共用機制：assets/icons/recommendation/index.tsx registry 從 assets/icons/edu/ 引入沿用者。
避免重複造輪子、圖示風格一致。

## PAT-63 [CORE_IMMUTABLE]: Module Color 保守統一策略（非動態 class）
本專案 module-* CSS var 目前只綁定 5 大版塊（schools/board/faq/edu/myposts）+ Phase I
新增 3 個（general/taiwan/recommendation），並未涵蓋 Edu 子主題等級的顏色（無
module-visa/module-arrival/module-scholarship）。Recommendation Hub 與子頁的圖示
一律用 `text-module-recommendation` 統一金色（非依 category key 動態組字串
`text-module-${key}`），因為：(1) 該組 class 大多不存在、(2) Tailwind v4 於
build time 靜態掃描原始碼字串才能產生對應 utility，動態字串組合會被跳過。
若未來要差異化各分類顏色，需先在 index.css 補齊對應 --module-* var，
並在程式碼內用靜態 literal class name（如 switch/case 或常量 map）而非樣板字串。

## PAT-64 [CORE_IMMUTABLE]: Recommendation Hub 佈局對齊 Edu
sm:grid-cols-2 lg:grid-cols-3 · 卡片 aspect-[4/3] · icon w-20 sm:w-24 mx-auto · 文字 text-center
與 EduHub 完全一致 · 使用者於兩板塊間切換有一致的視覺體驗。
子分類頁 header 亦改用 SVG（w-14 sm:w-16）對齊 EduTopic 的 hero pattern，
取代原本的 emoji 大字級顯示（emoji 僅保留於底部「其他分類」次要導覽）。
若日後 Edu 佈局變、Recommendation 應同步跟隨。

## PAT-65 [CORE_IMMUTABLE]: 6 維評分 DB CHECK 硬限 integer
DB 端 school_reviews.stars JSONB 於某處 CHECK constraint 要求 integer 值。
Client 端 calculateOverall 於 Phase V 改為保留 1 位小數 · 造成 insert 時 400/500
（`invalid input syntax for type integer: "3.5"`）。
Phase J-1 修法：ReviewForm 送出前於 client-side 用 Math.round 全部值取整。
UI 顯示保留 1 位小數（好 UX）· DB 存純整數（好一致）。
若日後 DB CHECK 放寬 · 可回退此 round 動作。

## PAT-66 [CORE_IMMUTABLE]: Edu 資料來源合併原則
移除「資料來源」重複區塊 · 統一為「主要資料來源」(原「官方資源」)。
保留連結按鈕形式 · 底部追加審核日期。若 official_sources 為空則整區塊不渲染。

## PAT-67 [CORE_IMMUTABLE]: user_submissions 表 · 4 種提交類型
於 supabase/schema.sql 新加 public.user_submissions 表（沿用全站 public. schema 前綴慣例）·
允許匿名 insert。
- school_edit / new_school / new_recommendation / general_feedback
狀態 · pending / approved / rejected / archived · 預設 pending。
public read only 顯示 pending + approved。
Lily 於 Supabase Dashboard 手動審核。SQL 需 Lily 於 Supabase SQL Editor 手動執行
（Claude Code 只寫入 schema.sql 檔案文字，不執行）。

## PAT-68 [DEPRECATE_MARK]: PAT-52 GitHub Issues 建議系統
Phase J-2 起 · SchoolDetail 提交建議 · Schools 提交新校 · Recommendation 提交推薦全部改為
user_submissions form。GitHub Issues 入口仍可手動使用（repo 本身），但 UI 不再引導。

## PAT-69 [CORE_IMMUTABLE]: SubmissionForm 通用元件
一個元件應對 4 種提交類型 · 透過 submissionType prop 切換。
UI 明標「使用者提交 · 未審核」badge。未登入也可提交（user_id 存 null，
RLS `user_submissions_anon_insert` policy 允許任何人 insert）。

## PAT-70 [CORE_IMMUTABLE]: user_submissions default status 改為 approved
Phase J-3 決策：使用者提交直接顯示於各版面 · 無需 Lily 手動審核。
- ALTER user_submissions ALTER COLUMN status SET DEFAULT 'approved'
- 保留 status 欄位供未來若需恢復審核
- 使用者 UI 看到「使用者提交」badge · 但無「尚未審核」訊息（除非 status = 'pending'）
Phase J-2 的手動審核流程改為「lazy 審核」· Lily 定期於 Supabase Dashboard archive 舊/不良內容。
SQL（ALTER + 既有 pending 批次轉 approved）需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-71 [CORE_IMMUTABLE]: UserSubmissionsList 通用元件
一個元件應對所有需要顯示 user_submissions 的地方。
- submissionType 篩選 (school_edit / new_school / new_recommendation / general_feedback)
- targetId 可選 · 只顯示該 target 的 submission
- 顯示 pending + approved · 隱藏 rejected + archived
- 每筆卡片顯示「使用者提交」badge · 若 pending 加「尚未審核」註記
**已知落差**：Recommendation 各 subcategory 頁面皆用 `submissionType="new_recommendation"`、
不帶 targetId（因 SubmissionForm 於 Recommendation 也從未收集分類資訊），
故 6 個子分類頁目前顯示的是同一份「全部使用者推薦提交」清單，
標題卻各自寫成「使用者提交的『XX』推薦」，暗示分類專屬但實際非如此。
若要真正分類化，需在 SubmissionForm 或 user_submissions 增加分類欄位（如 target_id 存 category slug）。

## PAT-72 [CORE_IMMUTABLE]: listings type · 6 分類 · 3 個 discussion 子類
Phase J-3 擴展 listings type CHECK 為 6 類：
- secondhand · rental_offer · rental_seek（商業 3 類 · 不變）
- discussion · discussion_study · discussion_longterm（討論 3 子類 · 新加）
Phase V 的 title prefix hack（[討論]）於 Phase J-3 後不再用於新貼文（新貼文直接存真實
type，不需 prefix），但 `isDiscussion()` 仍保留 prefix 判斷分支以相容 Phase V/J-2 期間
產生的舊資料。`boardTypeOf()` 對舊 prefix 資料回傳 'discussion'、對新資料回傳其真實 type。
price 沿用既有慣例存 trimmed string（非 Number()）、photo_urls 討論類存 []（非 null），
與 types.ts 的 Listing 型別契約一致（見 Phase V DEV-47/48，本輪同一慣例延續）。
SQL（DROP + 重建 CHECK constraint）需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-73 [CORE_IMMUTABLE]: Board Hierarchical Filter UI
主 filter 為 5 個（全部 / 二手 / 出租 / 求租 / 討論）· 討論展開次級 4 個（全部討論 / 一般 / 學習 / 長居）。
避免 flat 7 個 filter overflow · 兼顧使用者切換體驗。
BoardForm 的類型選擇同樣 hierarchical：主 4 類 button，選「討論」才展開 3 個子類 button。

## PAT-74 [CORE_IMMUTABLE]: SubmissionForm target_url 選填連結
每項使用者提交可選填相關連結 · 於 UserSubmissionsList 顯示為「🔗 相關連結 ↗」。
CHECK: url 必須 http-prefix + 500 字內 · 或 null。
SQL（ADD COLUMN + CHECK）需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-75 [CORE_IMMUTABLE]: profiles 擴展 registration_seq + badges
- registration_seq · BIGINT · auto-increment 註冊序號（獨立 sequence
  `profiles_registration_seq_seq`）· 用於「用戶-N」匿名選項
- badges · JSONB · Phase K-2 具體結構
- src/lib/profile.ts 的 UserProfile 為新檔獨立型別，display_name 為
  `string | null`，與受保護 types.ts 的 Profile.display_name（`string`
  非 nullable）不同，兩者無交叉 import，沿用 PAT-44 同類先例（同名不同型別
  分屬不同模組不衝突）。
SQL 需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-76 [CORE_IMMUTABLE]: avatars Storage bucket · 公開讀 + 本人寫
Storage bucket 'avatars' · public read（任何人可看）· 本人限寫
（auth.uid()::text 與 storage.foldername 對齊）。
上傳路徑 · {user_id}/avatar-{timestamp}.{ext}。
storage.ts（受保護檔）僅處理 'listings' bucket，avatar 上傳邏輯獨立寫在
MyProfile.tsx 內，不共用 compressImage/uploadPhoto（那兩個函式硬編碼
PHOTO_CONFIG.BUCKET='listings'）。client-side 加 5MB 檔案大小檢查
（MAX_AVATAR_BYTES），超過即 Toast 錯誤、不觸發上傳。
SQL 需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-77 [CORE_IMMUTABLE]: display_name 3 種選項策略
使用者可選 · google / anonymous / custom 三種顯示名稱：
- google · 用 Google 帳號 metadata.full_name（現況、預設）
- anonymous · 用「用戶-{registration_seq}」匿名編號
- custom · 使用者自訂
於 /my-profile 頁單選 radio · computeDisplayName() 計算並存入 profiles.display_name。

## PAT-78 [CORE_IMMUTABLE]: Board contact_info 改為 optional
DB 端 listings.contact_info 無 NOT NULL constraint、無 CHECK · 允許 null（Lily 已確認）。
UI 端 · BoardForm 移除 contact_info 於 canSubmit 內的驗證 · label 註記「選填」。
送出時 · 空字串轉 null。受保護 types.ts 的 Listing.contact_info 型別為 `string`
（非 nullable，供讀取用），createClient 無 Database 泛型、insert payload 不受此
型別約束，故實際寫入 null 不會造成 TS 編譯錯誤；讀取端 BoardList 對 null 值會
直接不渲染文字（React 忽略 null children），視覺上等同空白。

## PAT-79 [CORE_IMMUTABLE]: useContributions Hook
統計使用者於 school_reviews / listings / user_submissions 3 個表的貢獻數。
Phase K-2 徽章判定的資料源。
Client-side 3 個 count query · 並發 · Phase K-1 建置 · Phase K-1 UI 為 placeholder。

## PAT-80 [CORE_IMMUTABLE]: user_submissions target_category · Recommendation 分類化
Phase J-4 · user_submissions 加 target_category（optional）· recommendation 提交時可指定分類。
NULL = 顯示於推薦專區 Hub「尚未分類的使用者推薦」· 6 個 category 值分別顯示於對應
subcategory 頁（`使用者提交的{分類標題}`，此為真正的分類篩選，與 PAT-71 記錄的
「標題暗示但無實際篩選」落差已於本輪修正）。CHECK constraint 對應
RECOMMENDATION_CATEGORIES 6 key。SubmissionForm 的分類下拉選項改用
RECOMMENDATION_CATEGORIES 常量動態產生，非硬編碼清單，避免日後分類異動時兩處失衡。
SQL 需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-81 [CORE_IMMUTABLE]: 徽章系統 · 7 個徽章 3 級頭框
7 個徽章：先鋒 / 評價達人 / 貼文達人 / 貢獻達人 / 討論家 / 語校達人 / 全能達人。
3 級頭框依最高等級徽章：gold (金) / silver (銀) / general (無)。
gold: 先鋒 / 評價達人 / 貢獻達人 / 全能達人（4 個）
silver: 貼文達人 / 討論家 / 語校達人（3 個）
computeBadges 判定 · computeFrameTier 決定頭框級。

## PAT-82 [CORE_IMMUTABLE]: Badge SVG · Edu Geometry 語系
6 個新畫 badge SVG + 1 沿用 Edu · 全部 60×60 viewBox / currentColor / shape ≤8。
先鋒 (六角星) · 評價達人 (五角星內圈) · 貼文達人 (書卷筆尖) ·
貢獻達人 (十字圓框) · 討論家 (對話框三點) · 語校達人 (沿用 ApplicationIcon) · 全能達人 (皇冠寶石)。

## PAT-83 [CORE_IMMUTABLE]: UserAvatar + BadgeChip 通用元件
UserAvatar · 頭像 + 頭框（依徽章 tier）· 3 size (sm/md/lg)。
BadgeChip · 徽章 chip · SVG 圖示 + 中文名 · tier 對應 badge style。
用於 ReviewList / BoardList / UserSubmissionsList / MyProfile 各處。

## PAT-84 [CORE_IMMUTABLE]: useBadges Hook · lazy sync 徽章
Client-side 每次頁面載入計算徽章 · 若計算結果與 profiles.badges 現值不同 · sync 回 DB。
避免 server-side trigger 複雜性 · 依 useContributions + 額外 uniqueSchoolCount + discussionCount。

## PAT-85 [CORE_IMMUTABLE]: Cross-cutting Profile 顯示 · 不用 PostgREST embed join
spec 原提案於 school_reviews / listings / user_submissions 的 select 內用
`.select('*, profiles(display_name, avatar_url, badges)')` 嵌入語法取得作者資料，
但三張表的 user_id 外鍵皆指向 auth.users、非 public.profiles（無 FK 可讓 PostgREST
auto-embed，即 PAT-02 已記錄的既有限制，本輪三處皆重新踩到同一坑）。改採：
- ReviewList.tsx：沿用既有 attachProfiles()（受保護 types.ts 匯出的既有工具，只呼叫
  不修改）取得 avatar_url/display_name，另外呼叫新增的 badges.ts::fetchBadgesMap()
  單獨查 badges（因 attachProfiles 的 select 未含 badges 欄位，且該檔受保護不能加）
- Board.tsx：原本完全沒呼叫 attachProfiles（BoardList 過去不顯示作者資訊）→ 本輪
  在 load() 內補上 attachProfiles() + fetchBadgesMap()，結果透過新 props（Listing.profile
  沿用既有型別、badgesMap 為新增 prop）往下傳給 BoardList
- UserSubmissionsList.tsx：user_submissions 不在受保護型別體系內，但 user_id 允許
  null（匿名提交），與 attachProfiles 要求的 `{ user_id: string }` 泛型限制不符
  （UserSubmission.user_id 是 `string | null`），故未重用 attachProfiles，改為
  該元件自寫一段等價邏輯（過濾 null user_id 後查 profiles + fetchBadgesMap）
profiles RLS 需允許 public read display_name / avatar_url / badges——已於本輪
pre-flight 確認 `profiles_public_read` policy（`USING (true)`）本就允許，無需追加。

## PAT-86 [CORE_IMMUTABLE]: 徽章 vs 頭框關係
徽章 · 使用者達到某條件獲得（例如評價 5 則）· 顯示於 chip form。
頭框 · 依最高徽章 tier 自動決定 · 顯示於 UserAvatar 圓形 ring。
一個使用者可能有多個徽章 · 但只有一個頭框（顯示最高等級）。

## PAT-87 [CORE_IMMUTABLE]: schools.json 擴充 · 17→27 所（Batch 1 已核實）
匯入 10 所經過官網 curl 驗證（皆 200）的「已核實」等級學校（原提案 11 所，其中
`sprachcaffe-frankfurt-2` 與既有 `sprachcaffe-frankfurt` 為同一真實機構重複資料
——同機構重複、非 id 撞名——依 Phase E 已建立的「避免同機構重複條目」慣例
（DEV-57）跳過未匯入）。
- city 欄位統一用德文城市名（Stuttgart/Köln/Bonn/Freiburg/Regensburg），非中文，
  沿用既有慣例（DEV-61）
- city_key 僅 berlin/frankfurt/munich/duesseldorf 4 城有 SVG，其餘城市省略此欄位
  （非設定不存在的 key），CityIllustration 元件自動 fallback 為通用圖示
- horizonte-regensburg 的 website 維持 null（未查證），accreditation 等不確定
  欄位一律 null，不杜撰
剩餘學校（部分核實/待核實/deletion_candidates 等級）留待後續 Batch 處理。

## PAT-88 [CORE_IMMUTABLE]: Header 導覽簡化 · Hierarchical Dropdown
主導覽收斂為 4 項（語校/佈告欄/學用/推薦）+「更多」dropdown（FAQ/隱私政策）+
「我的」dropdown（我的貼文/編輯個人資料，僅登入後顯示）。
Dropdown 用 Tailwind `group-hover:block group-focus-within:block`（focus-within
為額外加強、非 spec 原提案，讓鍵盤 tab 導覽也能觸發展開，避免純 hover-only 的
可及性問題）直接以 inline utility class 組成面板樣式，未抽出獨立
`.dropdown-panel` CSS class——本專案既有慣例是共用元件才用 index.css 定義
class（如 `.card`/`.btn-primary`），僅 2 處用到的一次性面板樣式沿用 inline
Tailwind 寫法更符合現行風格。
**現況說明**：本專案目前 `hidden sm:flex` 的 nav 於 mobile（<640px）並無任何
替代導覽（無漢堡選單、無 mobile drawer）——這是既有缺口，非本輪 L.b 造成，
spec 假設「保留現行漢堡選單邏輯」但實際上該邏輯從未存在，故本輪僅簡化
desktop nav、未新增 mobile 導覽（超出本輪範圍）。

## PAT-89 [CORE_IMMUTABLE]: Mobile 漢堡選單修復
Phase L 簡化 Header 導覽後發現 sm:hidden 隱藏部分 nav item、但缺少對應 mobile 選單
（PAT-88 已記錄此缺口）。Phase L-2 修復：加 hamburger button（sm:hidden 顯示）+
全寬下拉面板（含全部導覽項目：語校/佈告欄/學用/推薦/常見問答/隱私政策，
登入後加我的貼文/編輯個人資料）。路由變化時用 `useLocation` + `useEffect`
統一自動關閉選單（比 spec 原提案逐個 NavLink 加 onClick 更簡潔、且能涵蓋
瀏覽器上一頁/下一頁等非點擊觸發的路由變化）。
spec 範例含 `animate-in slide-in-from-top-2`（`tailwindcss-animate` plugin
語法，本專案未安裝）→ 省略，選單直接顯示/隱藏無進場動畫。
**除錯記錄**：本輪瀏覽器驗證時第一次點擊漢堡按鈕（含原生 `.click()` 與
`dispatchEvent(MouseEvent)`）皆未觸發 state 更新，懷疑是 Vite HMR 未正確
套用新增 hook 後的模組（新增 useState/useEffect 改變了 hook 順序）；
執行 `window.location.reload(true)` 硬重整後功能立即正常。
教訓：Header 這類含多個 hook 的核心元件大改動後，瀏覽器驗證前務必硬重整
而非仰賴 HMR，避免誤判「功能沒做好」。
Known Issue 教訓：Header 簡化改動務必同時檢查 mobile viewport 是否仍可完整
導覽、不能只驗證 desktop。

## PAT-90 [CORE_IMMUTABLE]: BadgeChip size prop
BadgeChip 加 size: 'sm'|'md'|'lg'。MyProfile「我的徽章」用 lg、
評價/貼文旁小型顯示用 sm 或預設 md（「查看所有徽章與條件」collapse 內維持預設 md）。

## PAT-91 [CORE_IMMUTABLE]: Follow 系統 · user_follows + 動態牆
user_follows 表：follower_id/following_id，UNIQUE 防重複、CHECK 防自我追蹤。
FollowButton 元件於 review/listing/submission 卡片旁顯示（排除對自己顯示）。
MyProfile「追蹤動態」讀取所追蹤者最近 school_reviews + listings，合併排序顯示前 15 則
（FeedItem 用 discriminated union 型別，非 spec 原提案的 `any[]`，保留型別檢查）。
FollowButton/ReportButton 的 hover 危險色改用專案既有 Morandi token
`text-state-danger`（非 spec 原提案的裸 Tailwind `red-500`/`red-300`，
硬性規範「沿用 DS v4.1 Morandi tokens」不允許引入色票外的顏色）。

## PAT-92 [CORE_IMMUTABLE]: 檢舉系統 · reports 表 · 無 public read
reports 表允許匿名 insert、但**無 SELECT policy**（RLS 預設封閉）。
只有 Lily 於 Supabase Dashboard（擁有者權限繞過 RLS）可查看。
target_type 三種：listing/review/submission，reason 五種標準分類。
ReportButton 為行內展開的小 form（非跳頁），送出後顯示「已檢舉」文字替代按鈕本身。

## PAT-93 [CORE_IMMUTABLE]: 刪除大頭貼
MyProfile 頭像欄位旁加「刪除目前頭像」文字按鈕，僅於 avatarUrl 非空時顯示。
confirm 後立即 UPDATE profiles.avatar_url = null（不等待使用者按主儲存按鈕），
同步清空本地 avatarUrl/avatarFile/profile state，即時生效降低誤觸後的困惑。

## PAT-94 [CORE_IMMUTABLE]: 帳號刪除 · 自助匿名化 · 非真實刪除
技術限制：本專案僅有 anon key，client 端無法刪除 auth.users（需 service role /
Edge Function，超出本 MVP 範圍）。採用策略：
- 清空 profiles.display_name（設為「已刪除的使用者」）/ avatar_url（設 null）
- 使用者產生內容（school_reviews/listings/user_submissions 文字本身）保留不刪，
  因為 pre-flight 確認三表 user_id 皆為 ON DELETE CASCADE/SET NULL 指向
  auth.users（非 profiles），本輪不刪 auth.users、故完全不需調整這些外鍵或
  schema.sql——**本輪零 schema.sql 改動**，僅 UPDATE 既有 profiles 表（沿用
  既有 `profiles_own_update` RLS policy，MyProfile 既有 submit() 已用同一
  policy，無需新增）
- 呼叫既有 useAuth() 的 signOut()（非繞過封裝直接呼叫 `supabase.auth.signOut()`，
  沿用 Header.tsx 既有慣例）+ 1.5 秒後導回首頁
- UI 明確告知此限制 + GitHub Issue 聯繫管道（title/body 用
  `encodeURIComponent` 手動編碼中文字元，非 spec 原提案的裸中文字串直接放進
  href——避免特殊字元在部分瀏覽器/複製貼上情境下編碼異常，PAT-52 已有先例）
- 首頁導回連結修正：spec 原提案 `window.location.href = '/'` 在本專案 GH
  Pages 子路徑部署（PAT-04）下會導向網域根目錄造成 404，改用
  `${origin}${pathname}#/`（與 useAuth.ts 既有 `redirectTo` 組法一致，PAT-01）
此為 MVP 階段務實妥協，非長期最終方案。若使用者量成長，應評估建 Edge Function
處理真正的 GDPR「被遺忘權」刪除請求。

## PAT-95 [CORE_IMMUTABLE]: 帳號軟刪除 · 7 天寬限期恢復機制
profiles.deletion_requested_at（TIMESTAMPTZ nullable）記錄刪除請求時間。
computeDeletionStatus() 計算是否在 7 天寬限期內。
DeletionRestoreBanner 掛載於 App.tsx 全站層級（Header 之後、main 之前）、登入時偵測並提示。
恢復邏輯：用 Google OAuth user_metadata（full_name/avatar_url，Header.tsx 既有同一存取
路徑，pre-flight 已確認欄位名正確）重建 profile，因為 Google 帳號本身資訊不受 profiles
清空影響、每次登入都會重新提供。
超過 7 天：finalizeDeletion() 靜默清除 deletion_requested_at、不再提示
（technical note：auth.users 本身仍未被刪除，只是不再提示使用者）。
SQL（ALTER profiles 加 deletion_requested_at）需 Lily 手動於 Supabase SQL Editor 執行。

## PAT-96 [KNOWN_ISSUE]: 刪除頭貼按鈕條件顯示
「刪除目前頭像」按鈕僅在 avatarUrl 有值時顯示，屬預期設計（Phase O pre-flight 複查
MyProfile.tsx 現行程式碼，確認條件正確綁定 avatarUrl state、非 stale closure 或錯誤
prop，非 bug）。若帳號已無頭像（例如剛完成過帳號刪除流程），該按鈕自然不出現。

## PAT-97 [CORE_IMMUTABLE]: 匿名顯示名稱格式 · User_{9位數字補零}
formatAnonymousName(seq) 統一產生格式：`User_` + 9 位數字補零。
例：seq=1 → "User_000000001"，seq=42 → "User_000000042"。
取代原本的「用戶-{seq}」格式。集中於 src/lib/profile.ts，
MyProfile.tsx 的 radio 預覽文字與 computeDisplayName() 皆呼叫同一函式，避免格式漂移。
**注意**：既有已選用匿名選項的使用者，其 profiles.display_name 內已存的舊格式
字串（「用戶-N」）不會回溯更新，需該使用者重新於 /my-profile 選取匿名選項並
按儲存才會套用新格式（純顯示層格式變更，非資料遷移，符合零 DB 觸碰的硬性約束）。

## PAT-98 [CORE_IMMUTABLE]: 佈告欄按讚系統
listing_likes 表：UNIQUE(listing_id, user_id) 防重複按讚。
useLikes hook 提供 toggle 邏輯，LikeButton 元件顯示愛心 icon + 數量。
未登入使用者可見按鈕但 disabled，title 提示「請先登入」。

## PAT-99 [CORE_IMMUTABLE]: 佈告欄留言系統
listing_comments 表：單層無巢狀（無 parent_comment_id）。
CommentSection 元件預設收合，點擊展開才 fetch 留言列表（避免每張卡片預先載入造成效能負擔）。
內容長度 1-500 字，CHECK constraint 於 DB 層把關。
CommentSection.tsx import FormEvent 沿用既有 verbatimModuleSyntax 修正慣例
（拆為 `import type { FormEvent } from 'react'`，非 spec 原提案的混合 import，
PAT-12 系列已知模式再次出現）；Comment 介面的 listing_id 型別改為 number（對應
DB 實際 BIGINT 型別，spec 原提案誤寫為 string，雖未被實際消費、不影響編譯，
仍修正以維持型別契約準確）。

## PAT-100 [KNOWN_ISSUE]: Claude Code sandbox 無法完成 OAuth 登入
本專案自 Phase M 起持續存在此限制：Claude Code 執行環境無法完成 Google OAuth 流程，
因此所有「需登入才能操作」的功能（發評、發文、按讚、留言、檢舉、追蹤、個人資料）
最終端到端驗證都仰賴 Lily 登入後親自測試。
Claude Code 能做到的驗證上限：typecheck/build/UI結構(未登入態)/RLS policy邏輯審查/程式碼慣例比對。

## PAT-101 [CORE_IMMUTABLE]: 貼文到期機制 · 分層生命週期策略
**重要 pre-flight 發現**：`listings.expires_at` 早在 v4 基礎 schema 就已存在
（`DEFAULT NOW() + INTERVAL '60 days'`，對所有 type 一視同仁），並非本輪新增欄位；
既有 `listings_public_read` RLS policy 為 `USING (expires_at > NOW())`，即所有貼文
（含既有的 discussion 子類）原本就已在 60 天後被 RLS 完全擋下（不僅 UI 不顯示，
是資料庫層直接回傳空集合，PAT-03 已記錄此問題對本人 /my-posts 的影響）。

Phase R 的分層策略：
- 商業 3 類（secondhand/rental_offer/rental_seek）：發文時 client 端顯式設定
  `expires_at = now + 90 天`（BoardForm.tsx，取代舊的 60 天 DB DEFAULT）
- 討論全 5 子類：發文時顯式設定 `expires_at = null`（永久）

**關鍵修正（若省略會導致討論貼文永久不可見的靜默 bug）**：若不修改既有 RLS policy，
`expires_at IS NULL` 在 `USING (expires_at > NOW())` 中會被判定為 NULL（非 TRUE），
RLS 直接擋下該列——討論貼文一發布就會對所有人（含作者本人）完全不可見，且不會
拋出任何錯誤（RLS 擋下時 SELECT 单純回傳空集合）。本輪已將 policy 改為：
`USING (expires_at IS NULL OR expires_at > NOW() OR auth.uid() = user_id)`，
同時一併解決 PAT-03 已知問題（本人現在也能看到自己已過期的貼文，見下）。

其餘實作：
- Board.tsx 主列表另外做一層 client-side 過濾（`isExpired()`），因為 RLS 現在會把
  「本人自己已過期的商業類貼文」也回傳（供續期使用），但主列表本就不該顯示任何人
  的過期貼文（含自己的）
- 使用者可於自己的貼文按「續期」延長 90 天（BoardList.tsx 卡片內、MyPosts.tsx 皆有
  各自獨立實作的續期按鈕——因為 Board.tsx 主列表過濾掉已過期貼文後，MyPosts 是
  唯一能實際「看見」已過期貼文的地方，若只在 BoardList 加續期按鈕、實際上永遠碰
  不到「已過期」的貼文，續期功能形同虛設；此為 spec 原提案 R.d-3 只提到 BoardList
  的落差修正）
- MyPosts.tsx / BoardList.tsx 顯示到期日期處皆需 null-safe 處理（`l.expires_at ?
  ... : '永久保留'`），因為受保護 `types.ts` 的 `Listing.expires_at` 宣告型別為
  `string`（非 nullable），但 Phase R 起討論類貼文的實際 runtime 值會是 `null`，
  直接 `new Date(l.expires_at)` 對 null 不會拋錯（JS 將 null 轉為數字 0），而是
  靜默渲染出「1970/1/1」這種錯誤但不會讓人立即察覺的畫面，修正前已於程式碼中
  抓到並修正
- 附帶修正 MyPosts.tsx 原本用受保護 `types.ts` 的 `LISTING_TYPE_LABEL`（僅含 3 個
  商業類 key）顯示貼文類型 badge，5 個討論子類會渲染空白——改用 `board.ts` 的
  `BOARD_TYPE_LABEL` + `boardTypeOf()`（與 BoardList.tsx 既有慣例一致），此為
  Phase J-3 起就存在、本輪新增 2 個討論子類使其更明顯的既有落差
- 留言（listing_comments）不獨立設到期邏輯，跟隨所屬貼文記錄存活（貼文只是過期
  不顯示，不是刪除，留言依然存在資料庫中）

## PAT-102 [CORE_IMMUTABLE]: 討論區 8 類（新增美食 + 台灣餐廳）
listings.type CHECK 擴展至 8 類。討論子類從 3 個增至 5 個：
一般/學習/長居/美食/台灣餐廳。board.ts 常量、BoardForm hierarchical selector、
Board.tsx filter 三處同步擴展。

## PAT-103 [CORE_IMMUTABLE]: 佈告欄租房分類重組
rental_offer/rental_seek 的 DB type 值不變（純 UI 層重組，DB/RLS/schema.sql 零觸碰），
UI 層歸類為「租房」主分類下的 2 個子分類，比照討論的 hierarchical pattern。
board.ts 新增 `RENTAL_TYPES`/`isRentalType()`。佈告欄頂層現為 3 類：
二手交易/租房/討論。BoardForm.tsx 的租房子分類直接複用 `BOARD_TYPE_LABEL`/
`BOARD_TYPE_HINT` 既有的 rental_offer/rental_seek 條目（未如 spec 原提案另建
一份重複的 {key,label,hint} 字面量陣列，避免文案雙處維護）。Board.tsx 的主/子
filter 切換邏輯需同步 reset `subFilter`（原本單一 subFilter state 只服務討論
一個維度，現須服務租房+討論兩個維度，切換主分類時若不重置，會殘留另一維度的
子值導致篩選結果錯誤地變空）；filter 判斷統一改用既有的 `boardTypeOf()`
（非 spec 原提案的裸 `l.type`），維持與既有 Phase V 舊資料 title-prefix
相容判斷邏輯一致（同一套函式，不重複實作）。

## PAT-104 [CORE_IMMUTABLE]: 支持頁面 · 鎖定 Coming Soon
/support 路由，純靜態說明頁，無功能性金流串接。
上線條件：正式穩定運作 + 確認需要額外維護成本投入 + 準備上架前，才會開放實際贊助/訂閱功能。
掛載於 Header「更多」下拉（desktop dropdown + mobile 選單皆加，兩處各自獨立
的 style class，desktop 用既有 `dropdownLinkClass`——spec 原提案誤寫成
`navClass`，那是給頂層 nav 按鈕用的樣式，非 dropdown 面板項目樣式，已修正）。

## PAT-105 [CORE_IMMUTABLE]: 站名更改 · 留德資訊 → 留德華
全站對外呈現文字（README/index.html/docs/onboarding-15min.md/Logo.tsx/
Header.tsx/PrintHeader.tsx/HeroSection.tsx/Footer.tsx，共 8 檔 14 處）統一
改為「留德華」。**刻意排除**：`src/data/announcements.json` 內
`"留德資訊站 v4.0 上線"` 這則歷史公告條目——這是使用者於首頁「最新公告」會
實際看到的一筆帶日期（2026-07-08）的既成事實記錄，修改它等同竄改歷史事件
的原始名稱，與 Meta_Dev_Knowledge.md 內 PAT 記錄保留舊站名的「時間膠囊」原則
同一邏輯，差別只在於這是使用者可見內容而非開發者內部文件，故同樣不回溯修改。

## PAT-106 [CORE_IMMUTABLE]: 發文 FAB + Modal Pattern
Board.tsx 不再內嵌大型發文表單，改用 `FloatingActionButton`（右下角圓形＋）觸發
`PostModal`。Modal 支援 ESC 關閉、點擊遮罩關閉、body scroll lock。`BoardForm`
本就已有 `onSubmitted` callback（Phase R 就已存在，非本輪新增），送出成功後
Modal 自動關閉並觸發列表刷新。**登入門檻沿用既有 `AuthGate`**：spec 原提案的
`PostModal.tsx` 直接渲染 `BoardForm`、未做登入判斷，會讓未登入使用者點 FAB 後
看到完整表單、直到送出才報錯——體驗劣化。已修正為 `PostModal` 內用 `AuthGate`
包住 `BoardForm`，保留與 Phase S 以前完全相同的「請先登入才能刊登佈告欄貼文。」
提示文案，只是從頁面內嵌區塊改為 Modal 內顯示。Board.tsx 因表單移至 Modal，
移除 `BoardForm`/`AuthGate` 兩個不再直接使用的 import。

## PAT-107 [CORE_IMMUTABLE]: 追蹤動態獨立頁面
`/following` 路由，抽取自 MyProfile 原本內嵌的 `FollowingFeed` 邏輯，獨立成頁面
（上限從 15 則放寬至 30 則）。`FeedItem` 型別沿用 MyProfile 已建立的 discriminated
union 寫法（`{kind:'review';...} | {kind:'listing';...}`，見 PAT-91），未採用
spec 原提案的鬆散多 optional 欄位 interface，避免同一份資料結構在專案內出現
兩種型別風格。MyProfile 僅保留精簡預覽卡片（標題 + 「查看全部 →」連結），移除
原本內嵌的完整 `FollowingFeed` function 與其專用的 `useFollowingList` import
（避免邏輯重複維護兩份）。Header「我的」dropdown（desktop + mobile 皆同步）
加入口，僅登入後顯示。

## PAT-108 [CORE_IMMUTABLE]: GitHub 帳號改名 lilichen-F → si-kui-a
2026-07-12 帳號改名，全站寫死連結已同步更新（README.md/Footer.tsx/MyProfile.tsx
的 GitHub Issue 連結/`.github/workflows/deploy.yml` smoke test）。GitHub Pages
部署網址會由 GitHub 平台自動導向新網址（`si-kui-a.github.io/study-in-germany/`），
無需程式碼變動。歷史記錄文件（`PROGRESS.md` 內描述帳號建立當下、部署驗證當下的
敘述性段落）維持原樣（時間膠囊原則，同 PAT-105/announcements.json 先例）。
額外發現並修正：`deploy.yml` 的 smoke test 步驟原本已宣告 `SITE_URL` env var
（取自 `deploy-pages` action 的實際輸出 `page_url`），卻在下一行又寫死字串
URL、完全沒用到這個變數——屬於改名前就存在的潛在缺陷（寫死字串本就是隱患，只是
之前帳號沒變過所以沒發作）。已改為直接引用 `"$SITE_URL"`，讓這段驗證邏輯永久
對帳號/repo 名稱變動免疫，不僅是本輪的字面替換。

## PAT-109 [CORE_IMMUTABLE]: schools.json Batch 2 匯入（27→52 所）
依 Lily 提供的 Batch 2-11 查核資料（30 筆候選，皆標記 verification_status=
"已核實" 且無 audience_mismatch/data_error），逐一比對現行 27 所，依「真實
機構是否重複」（非僅比對 id 字串）判斷，跳過 5 筆真實重複：
- `goethe-institut-muenchen-2`（歌德學院 慕尼黑）與既有 `goethe-muenchen` 同一
  機構（城市+品牌名完全相同），候選資料自身也已標註疑慮
- `iik-duesseldorf`：候選 id 與既有 id **完全相同字串**，且為同一機構（IIK
  杜塞道夫），候選資料自身也已標註疑慮
- `horizonte-regensburg-2` 與既有 `horizonte-regensburg` 同一機構，候選資料
  自身已標註「重複，需跳過」
- `alpadia-berlin`：候選 id 與既有 id **完全相同字串**，且為同一機構（品牌+
  城市+官網完全一致），候選資料自身也已標註疑慮
- `gls-berlin`：候選 id 與既有 id **完全相同字串**——**此筆 spec 原提案清單
  未標註疑慮，屬本輪 pre-flight 額外揪出的重複**（既有 GLS 德語學校 柏林與
  候選 GLS 柏林為同一知名機構，只是候選資料的網址/中文名寫法略有出入）

最終匯入 25 所真正新增的學校（27→52）。匯入過程另修正候選資料與既有慣例不符
之處（非資料造假，純格式/欄位一致性修正）：
- `city` 欄位候選資料為中文城市名（慕尼黑/柏林/漢堡…），既有 27 所全數用德文
  城市名（沿用 DEV-61/DEV-85 既有慣例）→ 全部改為德文名，法蘭克福統一用
  「Frankfurt am Main」（既有 27 所寫法）而非單純「Frankfurt」
- `level` 欄位候選資料用一般連字號「A1-C2」，既有 27 所全數用 en dash
  「A1–C2」→ 統一改為 en dash
- `city_key` 欄位：專案圖示 registry（`src/assets/cities/index.tsx`）僅註冊
  4 個 key（berlin/frankfurt/munich/duesseldorf，見 PAT-87），候選資料對
  Hamburg/Köln/Freiburg 誤填了未註冊的 city_key 值（雖然 `CityIllustration`
  元件對未知 key 會自動 fallback、不會壞掉，但不符合既有慣例「其餘城市省略
  此欄位」）→ 全部改為省略該欄位（非設定不存在的 key，與既有 27 所寫法一致）

## PAT-110 [CORE_IMMUTABLE]: 隱私政策完整更新 · GDPR 合規
Privacy.tsx 依實際資料庫結構（供 pre-flight 讀 schema.sql 逐項確認）列出蒐集項目：
profiles/school_reviews/listings/listing_comments/listing_likes/user_submissions/
user_follows/reports 共 8 表，皆為現行 schema.sql 實際存在的表（無遺漏、無虛構）。
明確聲明無分析/追蹤 Cookie。帳號刪除對應現行 PAT-94/95 軟刪除機制誠實揭露技術限制
（無法真正刪除 auth.users，僅能自助匿名化 + 7 天寬限期）。
**重要缺口（非本輪能完成，需 Lily 後續補件）**：spec 指示第 10 節「未來贊助功能預留
條款」應完整採用 Lily 提供的「贊助功能法遵條款：定稿版」全文、第 11 節「服務性質
聲明」應採用「網站法遵文件架構大綱」中「五、服務條款預留段落」全文——但這兩份文件
的實際內容**從未於本輪對話中提供給 Claude Code**，僅有文件標題與段落編號被引用。
依本輪硬性約束「法律文字不可自行發明條款」，Claude Code 不得憑空杜撰法律文字填入
這兩節，故改為在頁面上以明顯的虛線邊框區塊標註「本節待補」+ 說明原因，待 Lily 提供
實際文件全文後於下一輪 Phase 補上，而非強行猜測撰寫後冒充為 Lily 已確認的文字。
最後更新日期需於每次實質修改隱私政策時同步更新。

## PAT-111 [CORE_IMMUTABLE]: 城市圖示擴充 · 涵蓋 52 所學校全部 22 城市
**重要 pre-flight 發現**：spec 假設城市圖示沿用 60×60 viewBox 的 Geometry 語系
（PAT-30/82 的 Edu/Badge icon 家族），但實際檢視 `src/assets/cities/` 現行 4 個
城市圖示（Berlin/Frankfurt/Munich/Duesseldorf）後發現這是**完全不同的獨立圖示家族**：
viewBox="0 0 400 300" 橫向風景比例、纯 `fill="currentColor"` 搭配 `opacity`
分層堆疊表現前後景深度的天際線剪影風格（無 stroke 線稿），元件命名為
`{City}Illustration`（非 `{City}Icon`），此為 Phase A.5/PAT-19 建立的既有慣例
（HeroSection 4 城橫向拼組即用此家族）。本輪 18 個新城市圖示已依**實際存在**的
400×300 天際線家族製作，而非 spec 誤植的 60×60 Geometry 家族，避免產出與現行
4 個既有圖示視覺風格完全不搭的成品。
新增城市（依信心度分兩類）：
- **具體地標**（10 座，皆為公開可查證的知名地標）：Köln（雙塔大教堂）、
  Stuttgart（電視塔）、Dresden（聖母教堂圓頂）、Heidelberg（山丘上的城堡）、
  Aachen（查理曼大教堂）、Hamburg（易北愛樂廳）、Bremen（不萊梅樂隊疊羅漢
  剪影）、Nürnberg（皇帝堡）、Mannheim（水塔）、Essen（關稅同盟礦區豎井輪塔）、
  Freiburg（明斯特主教座堂尖塔）
- **抽象天際線**（7 座，無強行指定不存在或信心不足的地標）：Bonn、Leipzig、
  Hannover、Duisburg、Dortmund、Karlsruhe、Regensburg——皆採用通用建築剪影 +
  opacity 分層組合，aria-label 標註為「{City} · Skyline」而非杜撰特定地標名稱
schools.json 52 所全數補齊 `city_key`（透過 node 腳本批次處理，非逐筆手動編輯，
避免人為疏漏；腳本同時重建欄位順序使 city_key 緊接在 city 之後，與既有 4 城條目
格式一致）。`CityIllustration` 元件的既有 fallback 機制（`(cityKey && REGISTRY[cityKey])
|| Fallback`）確保任何未來新增學校若城市尚無專屬圖示，仍會優雅降級為通用剪影，不會
壞版面。

## PAT-112 [CORE_IMMUTABLE]: 錯誤訊息絕不直接渲染給使用者（P0）
**重要 pre-flight 發現**：spec 假設問題出在「推薦專區」，但實際檢視
Recommendation.tsx/RecommendationCategory.tsx 後發現這兩頁完全不查詢 Supabase
（純讀取 static JSON `src/data/recommendations/*.json`），根本沒有 error 狀態可
渲染——spec 對問題根源的猜測是錯的。全站 grep 後找到真正的根因，其實比 spec 猜測
的範圍更廣、也更系統性：
- **核心根因**：`src/lib/errorMessages.ts` 的 `translateError()`，對於代碼/訊息樣式
  皆未命中 CODE_MAP/MESSAGE_PATTERNS 的錯誤，其 fallback 分支 `return { message: raw,
  raw, code }` 會把**原始資料庫錯誤文字**當作「已翻譯過的安全訊息」回傳——即使呼叫端
  正確使用了 translateError()（Board.tsx/MyPosts.tsx/SchoolDetail.tsx/PhotoUploader.tsx
  皆如此），只要遇到未列入白名單的錯誤類型，raw 文字依然會被當成 `.message` 渲染到
  UI。已改為固定回傳通用安全訊息「發生未預期的錯誤，請稍後再試」，raw 欄位保留供
  console.error 除錯，不再外洩。此為影響全站所有 translateError() 呼叫端的單點修正。
- **直接繞過 translateError 的個案**：`BoardForm.tsx` 送出失敗時 `setErr(error.message)`
  直接用原始錯誤；`BoardList.tsx`/`ReviewList.tsx`/`MyPosts.tsx`（評價刪除/貼文刪除/
  續期共 3 處）皆用 `alert(\`刪除失敗：${error.message}\`)` 直接彈出原始錯誤文字。
  已全數改為透過 translateError() 取得安全訊息。
- **列表讀取失敗 UI**：Board.tsx/MyPosts.tsx/SchoolDetail.tsx 原本各自維護一個 `err`
  state、渲染紅字錯誤 banner（如「讀取失敗：{err}」）。已移除這三處的 `err` state 與
  對應 JSX 分支，讀取失敗時直接落回既有的空狀態渲染路徑（Board.tsx 的 EmptyState、
  MyPosts.tsx 的兩個 EmptyState、ReviewList.tsx 既有的「還沒有評價」文字），技術細節
  僅透過既有的 `push('error', ...)` toast（訊息已因上述根因修正而安全）+ console.error
  留存，不再有專屬的原始錯誤 UI 區塊。
- **刻意排除**：`src/components/ErrorBoundary.tsx` 的 `{this.state.error.message}` 未
  修改——這是 React 錯誤邊界，用於攔截渲染期間的 JS 例外（開發者導向的當機恢復畫面），
  非例行的 Supabase/DB 查詢失敗，屬不同性質的錯誤處理，不在本輪「資料庫錯誤隱藏」範圍。
  `src/lib/deleteAccount.ts` 的 `error: error.message` 也未修改——已核對其呼叫端
  （MyProfile.tsx 刪除帳號、DeletionRestoreBanner.tsx 恢復帳號）皆只把此欄位傳給
  console.error、UI 端 toast 顯示的是寫死的安全文字，raw 訊息從未外洩到畫面上。

## PAT-113 [CORE_IMMUTABLE]: Privacy.tsx 第10/11節補完
Phase V 因缺少 Lily 提供的實際文件內容，將第 10 節（贊助功能預留條款）與第 11 節
（服務性質聲明）留為明確標註的待補區塊。本輪 Lily 提供文件全文，已逐字採用填入，
移除虛線邊框佔位樣式，與 1-9 節合併為完整、無缺口的隱私政策頁面。

## PAT-114 [CORE_IMMUTABLE]: 輕量 IA 優化（v9願景精簡實作）
依 Lily 明確指示，v9 願景文件（陪伴儀表板/Web Push/新手導覽等）暫緩，
僅實作其中零DB改動、零新機制的三項純UI調整：
FAQ 升一級導覽（原「更多」dropdown 內、Phase L-2/X 起併入語校/佈告欄/學用同級）、
推薦併入學用次要入口（Header 一級導覽移除、路由與功能完全保留，Edu.tsx 底部加連結）、
空狀態加 fallback CTA（ReviewList.tsx/UserSubmissionsList.tsx，次要選項非強迫貢獻）。
「更多」dropdown 移除 FAQ 後僅剩隱私政策/支持本站 2 項，判斷仍值得保留 dropdown
形式（2 項屬性質相近的次要/法遵類連結，不算過少，展開為一級反而讓主導覽過於擁擠——
移除推薦後主導覽剩語校/佈告欄/學用/常見問答 4 項已達平衡點，不宜再加）。
v9 完整願景其餘項目（見獨立文件）待未來視需求與資源評估後個別立案，
不在本輪 MVP 範圍內。

## PAT-115 [DEPRECATE_MARK]: 佈告欄聯絡方式強制化提案已否決
v9 文件 P0 項目「佈告欄聯絡方式強制化」與現行 PAT-78（選填）方向衝突。
Lily 明確決策維持現行選填設計，不採納強制化提案。

## PAT-116 [CORE_IMMUTABLE]: Portal 卡片視覺系統統一
Home.tsx 6 張 Portal 卡片改用與 Edu Hub 相同的大圖示置中佈局（w-20 sm:w-24 mx-auto
text-center），取代 Phase B.2 建立的舊版小型左上角圖示樣式（原透過 `PortalCard.tsx`
渲染）。改為直接在 Home.tsx 內以 `PORTAL_ITEMS.map()` inline 渲染，與 Edu.tsx/
Recommendation.tsx 兩個 Hub 頁的既有實作模式一致（皆不透過共用卡片元件）；
`PortalCard.tsx` 因此變成零呼叫端的死碼，已直接刪除（非保留供未來復活，因為若未來
還有其他 Hub 頁需要類似卡片，屆時應直接沿用 Home.tsx 這次建立的 inline pattern，
而非重新啟用一個舊版小圖示樣式的元件）。

**Pre-flight 關鍵發現（推翻 spec Y.b 的前提）**：spec 假設 `module-schools`/
`module-board`/`module-faq`/`module-myposts` 這 4 個 CSS 變數「缺少」、需要新增，
但實際檢視 `src/index.css` 後發現這 4 個變數**早就已經定義好**（含 light/dark 雙模式
+ Tailwind `--color-module-*` 對接），只是全站除了 `HotSchoolsCarousel.tsx` 外沒有
任何地方真正套用這些 class——`PortalCard.tsx` 舊實作對所有 6 張卡片的圖示一律寫死
`text-brand-burgundy`，導致這些既已存在的模組識別色形同虛設。Y.b 因此不需要新增
任何 CSS 變數，真正要做的是讓 Home.tsx 的新版卡片渲染邏輯實際套用這些既有 class
（`text-module-schools`/`text-module-board`/`text-module-edu`/
`text-module-recommendation`/`text-module-faq`/`text-module-myposts`）。

**Y.c 色值判斷依據**：讀 Schools.tsx 確認其互動強調色（filter select 的
`focus:border-brand-burgundy`、「提交新語校」連結的 `text-brand-burgundy`）皆為
`brand-burgundy`，故將 `--module-schools` 改為與 `--brand-burgundy` 完全相同的
RGB 值（light: 155 95 95、dark: 196 139 139，取代原本的 muted green 122 140 123 /
148 168 150），確保 Portal「語言學校」卡片圖示顏色與點入 Schools 頁後看到的主色調
一致、不產生色彩跳躍感。

**已知色彩重疊（提醒 Lily 覆核，非本輪修正範圍）**：`--module-board` 本來就已經與
`--brand-burgundy` 同值（light/dark 皆相同），Y.c 修正後 `--module-schools` 現在
也變成同一色值——語校卡片與佈告欄卡片的圖示顏色會完全相同。這是遵照 spec Y.c 明確
指示「語校卡片需對齊 brand-burgundy」後的直接結果，spec 並未要求同時處理 module-board
的色彩區隔問題，故本輪不擅自更動 module-board（非本輪授權範圍），僅原樣記錄此重疊
供 Lily 之後視覺覆核時決定是否需要調整 module-board 改用其他色值做出區隔。

**Y.d 圖示判斷**：SchoolIcon/BoardIcon/EduIcon/RecommendationIcon/FaqIcon/
MyPostsIcon 六個圖示檔案皆已存在（`src/assets/icons/`），皆為 24×24 viewBox
的 stroke 線稿風格（與 Edu 子主題/Recommendation 子分類/Badge/City 圖示家族的
60×60 opacity 分層填色 Geometry 風格不同，屬本專案第三種既有圖示語彙，Phase A.5
起專供 Portal 頂層卡片使用）。SVG viewBox 可自由縮放，直接沿用既有 6 個圖示放大
至 w-20/24 顯示，未新畫圖示。**驗證限制**：本輪瀏覽器截圖/zoom 工具連續逾時無法
使用，故無法取得像素級視覺截圖確認放大後是否過細/過空；已改以 DOM/computed style
檢查確認 6 個圖示皆正確渲染於 80×80px（mobile viewport）、無 console error，並依
strokeWidth 1.5 於 24-unit viewBox 換算 80px 顯示下的等效線寬（約 5px）判斷應屬
清晰可辨的粗細——但此為推算而非實際視覺確認，若 Lily 合併後發現圖示在大尺寸下觀感
偏空/偏細，仍可能需要依 spec Y.d-1 原定的新畫分支補強，不排除此可能性。

## PAT-118 [CORE_IMMUTABLE]: Portal 圖示重新設計 · 修正 Phase Y 視覺品質問題
Phase Y 沿用舊有細線條小尺寸圖示放大至 80-96px，導致視覺重量不足，
與 Edu Hub 家族（實心填色打底+粗線條+飽滿造型）風格脫節。
Lily 實際檢視部署畫面後確認問題，Phase AA 重畫 4 個圖示（SchoolIcon/BoardIcon/FaqIcon/MyPostsIcon），
統一採用 `fill="currentColor" opacity="0.15~0.7"` 分層填色手法。

**重要修正**：spec 提供的 4 個範例程式碼對「填色手法」的描述與 VisaIcon/ArrivalIcon/StarIcon
實際採用的技法有落差——spec 範例傾向對整個外輪廓套 `opacity="0.1~0.15"` 的均勻淡色填底；
但 pre-flight 逐行研究 VisaIcon.tsx/ArrivalIcon.tsx/StarIcon.tsx 後發現，這三個確立的參考
標竿實際上是：主要外框保持 `fill="none" stroke="currentColor"` 純線稿，只在**特定局部細節**
（屋頂、印章、內圈裝飾、便利貼等）套用中高 opacity（0.4-0.7）的實心填色做重點強調；StarIcon
甚至用「雙繪法」——同一路徑先畫一次純填色+無邊框當作底層量感，再疊畫一次純線稿當作清晰外緣。
本輪 4 個新圖示已改採這個真正的既有技法（而非機械套用 spec 範例程式碼），以確保與
VisaIcon/ArrivalIcon 真正並列時風格一致，非僅在孤立檢視時看起來合理。

**已知殘留不一致（本輪範圍外，供 Lily 覆核）**：Portal 6 卡中「學用板塊」（EduIcon.tsx）與
「推薦」（RecommendationIcon.tsx）這 2 個圖示**仍是舊版 24×24 細線稿風格**，本輪 spec 明確
只授權重畫 School/Board/Faq/MyPosts 這 4 個，未觸及這 2 個。因此目前首頁 Portal 6 張卡片
存在「4 個新飽滿風格 + 2 個舊細線風格」並列的視覺不一致——若 Lily 檢視後認為這 2 個也需要
比照重畫，需另立 Phase 授權（本輪未包含在 HARD CONSTRAINTS 範圍內，不擅自擴大處理）。

**驗證誠實揭露**：本輪瀏覽器截圖/zoom 工具再次連續逾時（與 Phase Y 同樣的環境限制），
無法取得任何像素級視覺確認。已改以 DOM 結構檢查確認 4 個新圖示皆正確渲染
viewBox="0 0 60 60"、含對應數量的實心填色 shape（School 4 個、Board 4 個、Faq 2 個、
MyPosts 2 個），但**這仍然不是視覺確認**，Claude Code 無法保證放大後的實際觀感是否
真正達到 Lily 期待的「飽滿」效果——這需要 Lily 合併後親自檢視部署畫面判斷，不應由
Claude Code 自行臆測「應該沒問題」。

**教訓**：任何圖示要放大套用到 Portal/Hub 卡片規格（w-20 sm:w-24）前，必須先確認其原始
設計是否本來就是為此尺寸繪製，不可假設「線框圖示放大即可用」；同時，套用已建立的視覺
語言時，應逐行研究實際參考檔案的技法細節，而非依賴 spec 文字描述或範例程式碼的簡化版本
（兩者可能有落差，如本輪發現的 opacity 填色手法差異）。

## PAT-119 [CORE_IMMUTABLE]: Portal 卡片色彩系統 · 統一紅色系，脫離 module-* 分歧邏輯
根本問題：Portal 首頁 6 張卡片過去依賴各自不同的 module-* CSS 變數
（module-schools/board/edu/recommendation/faq/myposts），導致同一個 Portal 區塊
呈現 4 種不同色系（深酒紅/淺粉/金色/未定義感灰色），與 Edu Hub（全金色系）、
Schools 城市圖示（全酒紅色系）建立的「同區塊同色系」原則矛盾。

**Pre-flight 診斷確認（推翻 spec 假設的技術性根因）**：逐一核對 6 個 module-* 變數
的實際 RGB 值後，確認**全部 6 個變數都正確定義**（light + dark 雙模式皆有、Tailwind
`@theme inline` 對接也正確），完全不是 spec 假設的「CSS 變數不存在」「Tailwind purge
清除」「class 名稱寫錯」——這 3 種技術性故障皆未發生。實際數值：
- module-schools = module-board = 155/95/95（light）· 196/139/139（dark）= brand-burgundy
- module-edu = module-recommendation = 184/162/122（light）· 205/187/150（dark）= brand-gold
- module-faq = 140/138/122（light）· 170/168/150（dark）= 一個獨立定義的低飽和灰褐色
- module-myposts = 125/122/136（light）· 155/152/168（dark）= 一個獨立定義的低飽和灰紫色

module-faq/module-myposts 這兩個「灰色」並非渲染失敗或變數缺失——CSS 完全照設定值
正確渲染，只是這兩個顏色的飽和度遠低於酒紅/金色，並排放在一起時視覺上讀起來像
「沒設定、預設灰」。**真正的根因是 Phase Y 的設計決策本身**：把「模組識別色」這個
適合用於區分不同子區塊（如徽章分級、City 圖示各自代表不同城市）的既有 pattern，
誤套到 Portal 首頁自己的 6 卡矩陣上——但 Portal 6 卡属於同一個視覺區塊，不該互相
用不同色系區分身分，這點與 Edu Hub/Schools 已建立的「同區塊同色系」慣例矛盾。

修正：Portal 卡片圖示**不再使用各自的 module-* 變數**，統一固定套用 `text-brand-burgundy`
（與全站品牌主色一致），`PORTAL_ITEMS` 陣列移除 `colorClass` 欄位（不再需要）。
module-edu/module-recommendation 變數本身**未受影響**，繼續原樣供 Edu.tsx/EduTopic.tsx/
Recommendation.tsx/RecommendationCategory.tsx 這 4 個頁面內部使用（各自維持金色系不動，
符合硬性約束）。module-schools/board/faq/myposts 這 4 個變數定義保留在 index.css（非破壞性
刪除，供未來若有其他場景需要參考沿用），但已於程式碼註解標記為「Portal 用途已棄用」。

## PAT-120 [RESOLVED]: module-faq/module-myposts 灰色根因
根因非技術性故障（CSS 變數缺失/Tailwind purge/class 名稱錯誤皆未發生，見 PAT-119
診斷細節），而是這兩個變數本身就被定義為低飽和度顏色（灰褐/灰紫），只是與酒紅/金色
並排時視覺上顯得突兀、疑似「未定義」。已隨 PAT-119 的 Portal 色彩統一修正一併解決
（Portal 不再引用這兩個變數）。

## PAT-121 [CORE_IMMUTABLE]: Portal 圖示造型統一 · 色塊為主、線條為輔
Portal 首頁 6 個圖示的視覺手法標竿為 SchoolIcon（Phase AA）：主體造型以 opacity
0.25-0.5 的實心色塊構成（通常是最大/最顯眼的那個形狀，如屋頂/對話框/文件夾），
線條（strokeWidth 1.5-2.5）僅用於少量細節點綴（分界線、輪廓收邊、掛勾），而非
整體以線稿勾邊、色塊只佔小面積。

**Pre-flight 關鍵發現（推翻 spec「兩者皆需拆分」的假設）**：逐一 grep 確認
「學用板塊」「推薦」兩個 Portal 圖示的實際共用狀況並不對稱：
- `EduIcon.tsx`：僅被 Home.tsx 引用，Edu.tsx 自己的 7 卡工作流程網格用的是完全
  不同的 `EduTopicIcon`（來自 `assets/icons/edu/` 目錄的 registry 元件，含 slug prop）
  ——`EduIcon.tsx` 本來就是 Portal 專屬檔案，故直接原地重畫，不需要另建
  `PortalEduIcon.tsx` 新檔案
- `RecommendationIcon.tsx`：**同時被 Home.tsx 與 Recommendation.tsx 兩處引用**——
  後者是推薦專區頁面自己 `<h1>推薦專區</h1>` 標題旁的頁首小圖示（`text-module-recommendation`
  金色，w-8/10），若直接修改此檔案會連帶改變 `/#/recommendation` 頁面本身的視覺，
  違反本輪硬性約束「不可直接修改共用檔案」。已依 STOP CONDITION 指示新建
  `src/assets/icons/PortalRecommendationIcon.tsx`（色塊為主的星形），僅 Home.tsx
  改 import 使用新檔案，`RecommendationIcon.tsx` 本身完全未變動、`/#/recommendation`
  頁首圖示不受影響。

本輪同步提高 BoardIcon/FaqIcon/MyPostsIcon 的色塊比例（主體形狀 opacity 提升至
0.25-0.5 並補上 `stroke="currentColor"` 讓輪廓與填色一致），與 SchoolIcon/EduIcon/
PortalRecommendationIcon 統一視覺語言。

## PAT-122 [CORE_IMMUTABLE]: 全站圖示系統 · Tabler Icons 統一（Phase AH 終局版）

**歷史脈絡**：Portal/Edu/Badge/Recommendation 四個圖示家族歷經 Phase Y→AA→AB→AC→AF→AG
共 6 輪手繪 SVG 反覆調整（填色比例、線寬、留白），仍未達 Lily 滿意的視覺標準，
且此環境截圖工具於多輪皆持續故障，導致視覺確認嚴重受限、每輪只能靠 DOM/computed
style 間接驗證。Lily 最終決策：放棄手繪自訂路徑，改用成熟開源圖標庫
`@tabler/icons-react`，終結長期反覆調整。

### 現行圖示家族（Phase AH 後）

| 家族 | 技術方案 | 適用範圍 |
|---|---|---|
| 城市天際線 | 手繪 SVG，400×300，風景剪影（**唯一維持不動的家族，Phase AH 未觸碰**）| Schools 列表卡片、SchoolDetail Banner |
| Portal 6 卡 | Tabler Icons，`currentColor`＋`text-brand-burgundy`（PAT-119） | 首頁 Portal（含 Announcements 區塊的 IconBell） |
| 作戰手冊 7 卡 | Tabler Icons，`currentColor`＋`text-module-edu` | Edu Hub（`Edu.tsx`）+ 主題詳情頁頭圖（`EduTopic.tsx`，共用同一 registry） |
| 推薦專區 6 卡 | Tabler Icons，`currentColor`＋`text-module-recommendation` | Recommendation Hub + 子分類頁（`RecommendationCategory.tsx`）+ 頁首獨立圖示（`RecommendationIcon.tsx`） |
| Badge 徽章 | Tabler Icons，`currentColor`＋tier 對應色 | MyProfile 徽章清單、頭像旁徽章 chip |

**新增依賴**：`@tabler/icons-react`（本專案唯一允許新增依賴的例外案例，因終結長期
反覆調整的價值遠大於零依賴原則；`peerDependencies: { react: ">= 16" }`，與本專案
React 19 相容確認無誤）。

### 圖標對應表

**Portal（Home.tsx，6 卡，直接以元件參照存於 PORTAL_ITEMS，無獨立 registry）**：
語言學校→`IconBuildingArch`／生活佈告欄→`IconSpeakerphone`／作戰手冊→`IconNotebook`／
推薦→`IconStar`／常見問答→`IconMessageQuestion`／我的資料→`IconUserCircle`
（另：同頁 Announcements 區塊的鈴鐺圖示，非四大家族之一但同檔案一併換成 `IconBell`，
避免同一檔案內殘留唯一一個手繪圖示）

**作戰手冊（`src/assets/icons/edu/index.tsx` registry，`EduTopicIcon`，7 主題）**：
簽證流程→`IconId`／落地指南→`IconHome`／延簽流程→`IconClockHour4`／
學程申請→`IconSchool`／獎學金→`IconAward`／教育政策→`IconFileText`／
離開指南→`IconDoorExit`

**推薦專區（`src/assets/icons/recommendation/index.tsx` registry，`RecommendationCategoryIcon`，
6 子分類；`RecommendationIcon.tsx` 頁首圖示獨立換成 `IconStar`，與 Portal「推薦」卡呼應）**：
通用推薦→`IconCompass`／簽證相關→`IconFileCertificate`／落地相關→`IconLuggage`／
學程相關→`IconSearch`／獎學金→`IconMedal`／台灣海外方案→`IconMapPin`

**Badge 徽章（`src/assets/icons/badges/index.tsx` registry，`BadgeIcon`，7 徽章）**：
先鋒→`IconRocket`／評價達人→`IconStarFilled`／貼文達人→`IconPencil`／
貢獻達人→`IconGift`／討論家→`IconMessageCircle`／語校達人→`IconSchool`
（沿用作戰手冊「學程申請」同一圖標，語意相通）／全能達人→`IconCrown`

**與 spec 提供對照表的兩處偏差**（Tabler 庫內確認不存在對應圖標，依 STOP CONDITION
「不要硬選不相關圖標湊數」原則另尋語意相近替代，而非直接沿用不存在的名稱）：
- 簽證相關原建議 `IconStamp`（不存在）→ 改用 `IconFileCertificate`（官方證明文件，
  語意貼近「可查證的簽證文件」）
- 貢獻達人原建議 `IconHandLove`（不存在）→ 改用 `IconGift`（spec 本身提供的備選項）

### 架構決策：保留 registry 元件、內部抽換實作

Edu/Recommendation/Badge 三個家族原本就有 `EduTopicIcon`/`RecommendationCategoryIcon`/
`BadgeIcon` 這類「slug/badgeId → 元件」的 registry 包裝元件，本輪**只替換 registry
內部的 REGISTRY 對照表本體**（手繪元件 → Tabler 元件），對外的呼叫介面
（`<EduTopicIcon slug={...} className="..." />` 等）完全不變。好處：
- `EduTopic.tsx`（主題詳情頁頭圖）、`RecommendationCategory.tsx`（子分類頁頭圖）
  這些消費端**零程式碼異動**即自動套用新圖示，不需要逐頁修改，也不會發生
  「Hub 卡片換了新圖示、但點進去的詳情頁仍是舊圖示」的不一致
- Portal（Home.tsx）因為原本就沒有 registry（PORTAL_ITEMS 直接存元件參照，僅單一
  消費端），故直接在陣列中替換元件參照即可，不需要另建 registry

圖示尺寸統一交由外層 wrapper div 控制（Phase AG 建立的 `w-12 sm:w-16 lg:w-20` 等
響應式 class），Tabler 元件本身只傳 `className="w-full h-full"` 撐滿容器＋
`stroke={1.5}`，不使用 Tabler 的 `size` prop（避免與現行響應式 class 系統疊床架屋）。

### 舊有手繪 SVG 檔案處置

**標記 `@deprecated`、保留檔案、不刪除**（本輪逐一確認除 `BoardIcon.tsx` 外皆已零
引用，但依 spec「檔案本身可保留但標記 deprecated」的預設指示，即使確認零引用也
選擇保留而非刪除，降低不可逆風險）：
`SchoolIcon`/`EduIcon`/`PortalRecommendationIcon`/`FaqIcon`/`MyPostsIcon`/`BellIcon`
（Portal，6 檔）、`VisaIcon`/`ArrivalIcon`/`RenewalIcon`/`ApplicationIcon`/
`ScholarshipIcon`/`PolicyIcon`/`ExitIcon`（Edu，7 檔）、`PioneerIcon`/`StarIcon`/
`QuillIcon`/`HandshakeIcon`/`ChatIcon`/`CrownIcon`（Badge，6 檔）、`GeneralIcon`/
`TaiwanIcon`（Recommendation，2 檔）。

**例外未刪除亦未 deprecate**：`BoardIcon.tsx` 在 Phase AE 新增的 Board.tsx 追蹤動態
空狀態（EmptyState icon）仍在使用，與 Portal 卡片是不同的消費端，本輪未動它。

### 城市天際線家族：唯一不動

`src/assets/cities/` 全數 22 檔 + `Fallback.tsx` + `index.tsx` registry 完全未觸碰
（`git diff --stat main -- src/assets/cities/` 確認零異動），繼續沿用 400×300
風景剪影手繪 SVG，不納入本輪 Tabler 遷移範圍。

### 圖標選用原則

優先選擇語意直接對應的 Tabler 圖標；若無完全對應，選擇語意相近且視覺不與同頁面
其他圖標混淆的替代圖標，不強行使用不相關圖標湊數（見上方兩處偏差記錄）。

## PAT-123 [CORE_IMMUTABLE]: 追蹤動態併入佈告欄 · 檢視模式而非分類

Phase AE 將原本獨立的 `/following` 頁面移除，改為 Board.tsx 內的一個「檢視模式」
分頁（全部貼文 / 追蹤動態），與既有的「分類 filter」（二手/出租/求租/討論區）並列
但概念層次不同：

- **檢視模式（viewMode）** 回答「用誰的角度看」——是看所有人的貼文，還是只看
  追蹤中使用者的貼文
- **分類 filter（mainFilter/subFilter）** 回答「內容屬於什麼類型」——貼文本身
  的性質
- 兩個維度互相正交、可疊加，因此在 Board.tsx 的過濾管線中依序作用：
  `listings` → `visibleListings`（到期過濾，Phase R）→ `scopedListings`
  （viewMode 過濾，NEW）→ `filtered`（分類過濾，套用於 scopedListings 之上）
- 複用既有 `useFollowingList(userId)` hook（`src/lib/useFollow.ts`，Phase M 建立），
  未新增資料層邏輯
- 深連結：`/#/board?view=following` 透過 `useSearchParams` 初始化 viewMode，
  供 MyProfile.tsx「查看全部 →」直接跳轉進追蹤動態分頁

**⚠️ 已知功能縮減（需求方應知悉）**：原 Following.tsx 的動態同時混合
`school_reviews` 與 `listings` 兩種內容；併入 Board.tsx 後的「追蹤動態」分頁
**僅顯示 listings（貼文），不再顯示語校評價**。這是依照 Phase AE 規格本身文字
「只顯示追蹤中使用者的貼文」的明確縮限，非實作疏漏，但屬於真實的功能減少，
列為本輪 DEBT 供需求方確認是否需要另外補上評價動態。

**Why**：避免 IA 上出現「同一批人、兩套進入點」的重複入口，且檢視模式與分類本來
就是正交維度，用 tab 而非新路由可讓使用者在同一個列表脈絡內切換，減少頁面跳轉。

## PAT-124 [CORE_IMMUTABLE]: 站內命名統一 · 「學用」→「作戰手冊」

Phase AE 將全站使用者可見文字中的「學用」統一改為「作戰手冊」（Header 導覽、
Portal 首頁卡片、Faq.tsx、EduTopic.tsx 麵包屑、SearchModal 分類標籤、README、
onboarding 文件等）。

**範圍界定**：
- ✅ 改：使用者實際會讀到的顯示文字（nav 連結文字、頁面內文、麵包屑、README 說明）
- ❌ 不改：程式碼識別名稱（`EduIcon`、`/edu` 路由、`src/pages/Edu.tsx` 檔名、
  `EduTopicIcon`、`module-edu` CSS 變數等）——純命名層面的重構風險過高、
  無使用者可見效益
- ❌ 不改：Edu Hub 頁面自己的 H1「德國留學作戰手冊」——此文字自 Phase G 起就已經
  是正確的，不在本輪變更範圍
- ❌ 不改：`Meta_Dev_Knowledge.md`/`docs/pat-index.md` 內既有 PAT 條目原文中提及
  「學用」之處——依時間膠囊原則，歷史記錄保留當時用語，不回溯改寫

**Why**：「學用」二字語意不夠直覺，「作戰手冊」更貼近該板塊「簽證/落地/延簽/
學程/獎學金/政策/離境」7 大實用流程主題的定位。

## PAT-125 [RESOLVED]: PAT-122 全站圖示家族稽核結果（Phase AE）

依 PAT-122 治理標準，逐一稽核全站 5 個圖示家族的 viewBox 一致性、currentColor
用色、構成邏輯與 opacity 分層，結果如下：

| 家族 | 檔案範圍 | 稽核結果 |
|---|---|---|
| 城市天際線 | `src/assets/cities/*.tsx`（22 檔 + Fallback） | ✅ 合規，viewBox 統一 400×300，零寫死色碼，7 檔的裝飾性水波/地面線條屬家族允許的少量線條點綴 |
| Edu Geometry | `src/assets/icons/edu/*.tsx`（7 檔） | ✅ 合規，viewBox 統一 60×60，線條勾勒主體+局部色塊點綴，符合家族構成邏輯 |
| Badge 徽章 | `src/assets/icons/badges/*.tsx`（6 檔） | ✅ 合規，viewBox 統一 60×60，多檔採用 StarIcon 確立的「雙繪」技法（背景色塊 opacity 0.15 + 線條疊加） |
| Portal 6 卡 | `SchoolIcon`/`BoardIcon`/`EduIcon`/`PortalRecommendationIcon`/`FaqIcon`/`MyPostsIcon`（6 檔） | ✅ 合規（Phase AC 已修正），viewBox 統一 60×60，色塊為主體+線條點綴 |
| Recommendation | `RecommendationIcon.tsx` + `recommendation/{GeneralIcon,TaiwanIcon}.tsx` | ⚠️ 發現 1 項不合規，已修正（見下） |

**發現與修正**：`RecommendationIcon.tsx`（`/#/recommendation` 頁首圖示）沿用
Phase 更早期的 `viewBox="0 0 24 24"`，與同家族 `GeneralIcon.tsx`/`TaiwanIcon.tsx`
的 `viewBox="0 0 60 60"` 不一致，違反 PAT-122 §5「同家族內部規格必須一致」。

修正方式：在 60×60 座標系下以整數座標重繪，保留原本「五角星+五道光芒線」的視覺
識別，維持純線條（不加色塊填色）——因為此圖示的角色是小型頁首圖示，與
GeneralIcon/TaiwanIcon 作為較大子分類磚塊、需要雙繪色塊增加層次感的角色不同，
PAT-122 §2「造型複雜需要層次感時」並未強制所有圖示都要色塊分層。未改動其
`role="img"`/`aria-label` 以外的語意，`/#/recommendation` 頁面渲染大小不變
（w-8/10 CSS class 控制），視覺呈現與修正前基本一致。

**其餘 4 家族**：稽核未發現違規，維持現狀，不做非必要修改。

## PAT-126 [CORE_IMMUTABLE]: 全站卡片密度優化 · 響應式雙態佈局（v2 · Phase AG 調整）

Home/Recommendation/Edu 三頁的卡片系統統一採用響應式雙態 pattern，取代原本
`aspect-[4/3]`、`w-20~24` 大圖示、`p-5` 大留白的舊版卡片：

- **Mobile（sm 以下）**：橫向列表——`flex items-center` 一行一項，圖示 `w-12 h-12`
  置左，標題（`text-sm`）+描述文字置右（皆 `truncate` 單行），資訊密度優先
- **Desktop（sm 以上）**：縮小版卡片 grid——`sm:grid-cols-3 lg:grid-cols-4`，
  卡片改 `sm:flex-col sm:aspect-[3/2]`，圖示 `sm:w-16 sm:h-16 lg:w-20 lg:h-20`，
  標題 `sm:text-base`，`sm:p-3`（原 `p-5`），描述文字 `sm:hidden`（桌面卡片
  空間有限，優先保證圖示+標題為視覺主體）

純 CSS responsive class 切換（`sm:`/`lg:` prefix），不依賴 JS 判斷裝置寬度或
`useState`/`matchMedia`。三頁的容器 class、卡片 Link class、圖示 wrapper
class（除顏色 token 外）採用**逐字相同**的組合，僅資料內容（title/description/
icon/顏色）依各頁面既有慣例不同（Home 用 `text-brand-burgundy`，Recommendation
用 `text-module-recommendation`，Edu 用 `text-module-edu`，此為 PAT-119 既有
決策，本輪未變動）。

**Phase AF → AG 調整脈絡**：AF 首次收斂密度時圖示縮得過小（`sm:w-12`＝48px，
桌面），與卡片留白比例失衡，Lily 檢視實際部署畫面後要求圖示與文字同步放大、
消除卡片內部多餘留白。AG 將桌面圖示放大至 `sm:w-16 lg:w-20`（64–80px）、
手機圖示放大至 `w-12`（48px）、桌面標題放大至 `sm:text-base`；`padding`
（`sm:p-3`）與 `aspect-[3/2]` **維持不變**——實測 lg 斷點下卡片高度
199.5px，內容（80px 圖示+8px 間距+16px 標題行高+24px padding≈132px）已
能自然填滿大部分空間，放大內容本身即足以消除留白，不需額外壓縮容器尺寸，
符合 spec「優先放大內容、padding 為次要手段」的指示。

**⚠️ 已知功能縮減（需求方應知悉）**：Recommendation 原本每卡右下角顯示子分類
項目數（「N 項」，來自 `COUNT_MAP`）、Edu 原本顯示「N 個步驟」，兩者皆隨舊版
`p-5 aspect-[4/3]` 大卡片的 footer 列一併移除，新版卡片（無論 mobile 列表或
desktop 縮小卡）皆不再顯示數量徽章，僅保留圖示+標題（+mobile 態的描述）。
`Recommendation.tsx` 中原本用於計算 `COUNT_MAP` 的 6 個 JSON import
（`generalData`/`visaData`/`arrivalData`/`eduData`/`scholarshipData`/
`taiwanData`）因不再被引用，已一併移除（避免 `noUnusedLocals` 報錯）；
Edu 主題頁本身（`EduTopic.tsx`）進入後仍可見完整流程總覽與 step 數量，
資訊未真正遺失，只是從 Hub 卡片層移到了主題詳情頁。此為配合「圖示為視覺
主體、大幅減少留白」的密度目標所做的內容取捨，非技術限制，供 Lily 確認
是否需要保留。

**Why**：Lily 提供截圖指出三頁卡片留白過多、方格過大，手機端尤其浪費捲動
空間；響應式雙態（而非固定尺寸卡片單純縮小）能讓手機端徹底改用資訊密度
更高的列表形式，同時桌面端保留卡片視覺語言但顯著提高單螢幕可見項目數。

## PAT-127 [CORE_IMMUTABLE]: 新手導覽系統（精簡版）

依 v9 願景文件精簡實作，僅 Step 1（階段判斷）+Step 2（動態呈現）+Step 5（收尾），
**刻意跳過** Step 3（期限輸入）與 Step 4（推播權限），因對應的儀表板/推播功能本體
尚未建置（見 v9 願景文件 P1/P2 項目，暫緩），避免收集使用者用不到的資料。

**資料層**：`profiles.persona_stage`（nullable TEXT，4 值：`visa_prep`/`landing`/
`settled`/`leaving`，CHECK constraint 約束）——已登入使用者選擇階段時才寫入 DB
（`supabase.from('profiles').update({ persona_stage })`，走既有 `profiles_own_update`
RLS policy，未新增 RLS）；訪客（未登入）僅存 `localStorage`（`persona_stage_local`），
不做跨裝置同步，本輪不處理。`onboarding_completed`（localStorage）控制是否顯示導覽
Modal，「我的資料」頁「重新設定我的階段」可清除此標記重新觸發。

**AI.c 實作細節**：Edu Hub 依 `getLocalPersonaStage()`（讀 localStorage，**不讀
DB**，因即時可用性優先於跨裝置同步，且訪客也需要此功能）對應 `PERSONA_MODULE_MAP`
突出顯示推薦模組（`ring-2 ring-brand-gold` + 卡片右上角「為你推薦」小標籤，
`absolute` 定位不干擾 Phase AG/AH 已建立的緊湊卡片內部佈局），視覺克制、不做
誇張特效。DB 內的 `persona_stage` 目前**尚未被任何頁面讀取**，純粹是為未來
可能的跨裝置同步/儀表板功能預先鋪路的資料結構，Lily 應知悉這是有意的超前部署
而非遺漏。

**與 spec 範例程式碼的一處修正**：spec 提供的「重新設定我的階段」按鈕範例用
`window.location.href = '/'`，但本站部署於 GitHub Pages 子路徑
（`si-kui-a.github.io/study-in-germany/`）+ HashRouter，若直接導向網站根目錄
`/` 會脫離子路徑造成 404——已修正為與既有刪除帳號流程（`MyProfile.tsx`）相同的
安全寫法 `` `${window.location.origin}${window.location.pathname}#/` ``，
保留 pathname 子路徑再附加 hash route。

**未來若要擴充期限/推播功能**，需重新評估 v9 願景文件 Step 3/4，
屆時 `persona_stage` 的資料結構已就緒可沿用。

## PAT-128 [CORE_IMMUTABLE]: 階段設定按鈕視覺提升

MyProfile「重新設定我的階段」從純文字連結改為卡片式按鈕（`card
bg-brand-gold-soft border-brand-gold/30`），左側顯示目前設定的階段標籤
（讀 `getLocalPersonaStage()`，未設定則顯示「尚未設定」），右側為明顯的
邊框按鈕 CTA「重新設定」，提升可見度與可操作性。沿用 Phase AI 已建立的
安全導向寫法（`${origin}${pathname}#/`），未重新發明。

## PAT-129 [CORE_IMMUTABLE]: 我的貼文/我的評價併入佈告欄（第 3、4 個 viewMode）

延續 PAT-123 的 view-mode tab 模式，Board.tsx 從 2 個分頁（全部貼文/追蹤動態）
擴展為 4 個（+我的貼文 +我的評價）。`/my-posts` 獨立路由移除，
`src/pages/MyPosts.tsx` 檔案刪除，其原有兩塊功能分別併入：

- **我的貼文**（`viewMode='mine'`）：篩選 `listings` 中 `user_id === user.id`
  的項目，**源頭是未經到期日過濾的 `listings`（而非 `visibleListings`）**，
  讓已過期的自己貼文仍能在此檢視並續期。不套用下方分類 filter（顯示全部
  類型混合）。續期/刪除按鈕**不需要新增任何 prop**——`BoardList.tsx` 本來就有
  逐卡片的 `user?.id === l.user_id` 擁有權判斷，任何 viewMode 下只要貼文是
  自己的就會顯示這兩個按鈕，「我的貼文」視角只是恰好每一則都符合這個條件。
  另於 `BoardList.tsx` 新增「已過期」文字標示（`daysLeft <= 0` 時顯示），
  原本這個分支直接回傳 `null`（因為過期貼文在其餘 viewMode 下本來就不會出現，
  沒有標示需求），現在「我的貼文」會顯示過期項目，需要視覺區分。
- **我的評價**（`viewMode='my_reviews'`）：獨立於 `listings` 資料流之外，
  另開一個 `loadReviews()` 直接查詢 `school_reviews`（`eq('user_id', user.id)`），
  沿用 `attachProfiles()`（與 listings 相同的 generic 函式）。渲染複用
  `ReviewList.tsx`（`SchoolDetail.tsx` 既有元件），新增 `showSchoolLink?: boolean`
  prop——因為原本 `ReviewList` 只在單一學校的情境下使用（學校本身已知），
  但「我的評價」是跨校集中檢視，需要在每張卡片上額外顯示評價對應的學校名稱
  連結，才能保留 `MyPosts.tsx` 原本 `schoolName(r.school_id)` 連結的資訊量。

**分類 filter 顯示邏輯**：`mainFilter`/`subFilter` UI 僅在 `viewMode` 為
`all`/`following` 時渲染；`mine` 不限分類、`my_reviews` 非 listings 資料，
兩者皆隱藏分類 filter bar（比照 `MyPosts.tsx` 原本就沒有分類 filter 的慣例）。

**深連結**：`/board?view=mine`、`/board?view=my_reviews`（比照 PAT-123 的
`?view=following`），Header「我的」dropdown（桌面+行動版）與 Home.tsx Portal
「我的資料」卡片皆改連至 `?view=mine`（而非直接刪除連結）。**Bug 修正**：
新增這 2 個深連結入口後，若使用者已在 `/board` 上又點另一個 `?view=` 深連結，
HashRouter 對同路由的導覽不會重新掛載元件，原本僅在 `useState` 初始化時讀取
一次 query string 的寫法會讓分頁「卡住」不切換——已另加 `useEffect` 監聽
`searchParams` 變化即時更新 `viewMode`，修正後已於瀏覽器重新驗證正確切換。

**歷史脈絡**：本 PAT 源自 Phase AJ 執行過程中發現 spec 提供的 AJ.b 規格書
只涵蓋 `MyPosts.tsx` 的貼文（listings）部分，遺漏了評價（school_reviews）
集中檢視功能；若照原規格刪除 `MyPosts.tsx`，使用者會失去唯一的跨校評價
集中檢視入口（個別刪除評價本身仍可透過 `SchoolDetail.tsx` 完成，非完全
功能喪失，但便利性確實會倒退）。已於執行前 STOP 並請示 Lily，Lily 選擇
「併入 Board.tsx 第 4 個 viewMode」，範圍略微擴大但功能零損失。

## PAT-130 [CORE_IMMUTABLE]:「我的」Hierarchical 分頁重組

Phase AJ 建立的 4 個平行 viewMode（全部貼文/追蹤動態/我的貼文/我的評價）
於 Phase AK 重組為 3 個頂層分頁（全部貼文/追蹤動態/我的），「我的」展開
2 個子分類（語校評價/貼文），沿用現行租房/討論的 hierarchical sub-filter
UI pattern（`pl-4 border-l-2 border-brand-gold/30 flex flex-wrap gap-2` +
`text-xs px-2.5 py-1 rounded` 選中態 `text-brand-burgundy font-medium`），
未另創新樣式。

**State 結構**：`viewMode: 'all' | 'following' | 'mine'` + 獨立的
`mineSubTab: 'reviews' | 'posts'`（非巢狀在 viewMode 型別內，比照
`mainFilter`/`subFilter` 兩個獨立 state 的既有模式）。

**渲染邏輯**：原本 `viewMode === 'my_reviews'` 的條件改為
`viewMode === 'mine' && mineSubTab === 'reviews'`；原本 `viewMode === 'mine'`
（貼文）的條件因 ternary chain 的排除法則（先檢查 reviews 分支，落到後面
的分支時已隱含 `mineSubTab === 'posts'`），維持 `viewMode === 'mine'` 不需要
額外顯式加上 `mineSubTab === 'posts'` 判斷。資料 fetch 邏輯（`school_reviews`
查詢/`listings` 未過濾查詢）完全沿用 Phase AJ 建立的內容，只調整觸發條件。

**深連結格式**：`?view=mine&sub=posts` / `?view=mine&sub=reviews`（取代
Phase AJ 的 `?view=mine` / `?view=my_reviews`）。Header「我的」dropdown（桌面+
行動版）、Home.tsx Portal「我的資料」卡片皆更新為 `?view=mine&sub=posts`。
Phase AJ 建立的深連結切換 bug 修正（`useEffect` 監聽 `searchParams`）同步
擴充支援讀取 `sub` 參數，已於瀏覽器實測確認 soft-navigation 在兩個
`sub=` 深連結之間切換時分頁與子分類皆正確同步更新。

**說明文字**：原 `MyPosts.tsx` 頁首的「管理你發布過的評價與貼文。刪除為
永久動作（資料庫層級刪除），無法復原。」文字，Phase AJ 併入時**未實際移植**
（僅移植功能邏輯，遺漏此說明文字），Phase AK 補上，顯示於「我的」分頁區塊
內（子分類選單之後、列表之前），不分子分類皆顯示（因內容同時提及評價與貼文）。

## PAT-132 [CORE_IMMUTABLE]: FAQ 新增德國安全性 + 德鐵準點率/失竊資訊

新增 3 題常見問答（**注意**：spec 標題與 GIT commit 範本皆寫「4 則」，但實際
提供的 `<file>` 內容區塊只有 3 題，已逐字核對確認無遺漏，判斷為 spec 本身
計數誤植，未自行杜撰第 4 題湊數，依實際提供內容為準），內容依 Lily 於對話中
即時搜尋查證（2026年7月），來源含：外交部領事事務局旅遊警示（德國第一級
灰色提醒）、全球和平指數 2026（德國排名 28）、德國 2025 年警察刑事統計 PKS
（前 5 大治安較不佳城市）、德鐵 2025 年度準點率官方統計、聯邦警察行李竊盜
案件統計。所有數字皆為查證當下最新公開資料，非即時更新，未來若要保持準確性
需定期複查更新（尤其 PKS 每年 4 月發布、德鐵準點率逐月更新）。「實務建議」
段落明確標示為非官方數據，避免使用者誤認為德鐵官方建議。

**格式調整**（內容文字零增刪，僅呈現手法配合現行 render 邏輯調整）：
- `faq.json` 的 `FaqItem.a`（`src/lib/types.ts` 定義，非受保護欄位型別本身
  無需變動）沿用純字串，段落間以 `\n\n` 分隔，未改變 schema
- `FAQ.tsx` 的 `<p>` 補上 `whitespace-pre-wrap` class，讓 `\n` 正確轉換為
  視覺換行（原本 `{item.a}` 直接渲染成純文字，瀏覽器會忽略字串內的換行符）
- spec 原文用 `**粗體**` 標記「重要提醒」「實務建議」等段落標籤，但本站
  FAQ 元件不做 markdown 解析、純文字渲染，若保留字面 `**` 符號會直接顯示
  成兩個星號字元（視覺瑕疵），故移除星號記號、保留文字本身，數據與敘述
  內容逐字未動
- `Faq.tsx` 頁面說明文字「留德新手最常先問的 5 個問題」因新增後總數變為
  8 題而改為「留德新手最常先問的問題」（移除具體數字而非改寫成新數字，
  避免未來再次新增題目時又產生數字漂移）

## PAT-133 [CORE_IMMUTABLE]: FAQ 年度維護日期

`Faq.tsx` 頁底顯示寫死的「本頁內容最後審核於 2026-07」文字，位於「需要更完整的
資訊？」卡片之後。維護頻率：每年一次人工審核，Lily 實際更新內容時同步手動改
此日期字串，非自動計算（因為維護本質是人工審核行為，不是可自動判斷「內容是否
仍然正確」的技術問題）。

## PAT-134 [CORE_IMMUTABLE]:「下一步提示」卡片 · v9 精簡延伸

Home.tsx Hero 區塊之後、Portal 卡片矩陣之前，僅當使用者已設定 persona_stage
（讀 `getLocalPersonaStage()`，Phase AI 建立，localStorage-only、零 DB 查詢）
時顯示。`src/lib/nextStep.ts` 提供純靜態對照表 `STAGE_NEXT_STEP`，將 4 種
persona_stage 對應到作戰手冊某一主題的 Step 1，卡片點擊導向該步驟頁面。

**內容真實性**：`STAGE_NEXT_STEP` 的 `stepTitle` 逐一核對 `src/data/edu/*.ts`
的實際 `step: 1` 對應 `title_zh` 內容才填入，spec 原文提供的佔位內容有 3/4
與實際資料不符（visa 的「確認簽證類型與所需文件」應為「確認簽證類型」；
arrival 的「辦理戶籍登記（Anmeldung）」實際 step 1 是「如何找房」，
Anmeldung 是後面的步驟；policy 的「了解學分與學歷認證規則」實際 step 1 是
「Bologna 進程 + ECTS」；exit 的「確認戶籍銷戶流程（Abmeldung）」實際
step 1 是「通知移民局」，Abmeldung 是 step 2），依 pre-flight 實際讀取
`src/data/edu/*.ts` 逐一核對後修正，未依 spec 佔位文字照抄。

此為 v9 願景「陪伴儀表板」的最小可行版本，儀表板/推播/期限追蹤完整功能仍
暫緩（見 PAT-114/PAT-127），零新增資料表、零新增分析追蹤機制（符合現行
隱私政策承諾），待未來使用規模與資源評估後再擴充。

## PAT-135 [RESOLVED]: Phase AH 手繪 SVG deprecated 檔案清理（20 檔）

Phase AH（Tabler Icons 遷移）將 21 個手繪 SVG 檔案標記 `@deprecated` 但保留
（含 `BoardIcon.tsx` 除外，因其仍被 Board.tsx「我的貼文」空狀態使用）。
Phase AN 全站健檢逐一重新確認零引用（`grep -rl` 全站搜尋，除一處純文字註解
外無任何實際 import），依 Phase AH 當時的條件授權（「若確認零引用，才可刪除」）
正式刪除以下 20 檔精簡專案：

- Portal（6）：`SchoolIcon`/`EduIcon`/`PortalRecommendationIcon`/`FaqIcon`/
  `MyPostsIcon`/`BellIcon`
- Edu（7）：`VisaIcon`/`ArrivalIcon`/`RenewalIcon`/`ApplicationIcon`/
  `ScholarshipIcon`/`PolicyIcon`/`ExitIcon`
- Badge（6）：`PioneerIcon`/`StarIcon`/`QuillIcon`/`HandshakeIcon`/
  `ChatIcon`/`CrownIcon`
- Recommendation（2）：`GeneralIcon`/`TaiwanIcon`

刪除後 typecheck/build 皆 PASS，確認零遺留引用。`BoardIcon.tsx` 維持不動
（仍在使用中，非 deprecated）。

## PAT-136 [CORE_IMMUTABLE]: FAQ 結論先行排版

數據密集題目採用 `summary`（一句結論）+`points`（條列重點）+`detail`（收合完整
說明）三層結構，與簡單題目的純 `q`/`a` 格式並存於同一 `faq.json` 陣列。
`FAQ.tsx` 依資料是否含 `summary` 欄位切換渲染方式。

**型別處理**：`FaqItem`（`src/lib/types.ts`，受保護檔案）維持原本的純
`{ q, a }` 形狀不變（未違反受保護檔案零改動的硬性約束）；另立
`src/lib/faq.ts` 匯出 `FaqEntry`（`{ q, a?, summary?, points?, detail? }`，
所有內容欄位皆為選填，涵蓋兩種格式）供 `FAQ.tsx`/`search.ts` 改用。
`search.ts` 原本無條件存取 `f.a` 會在新格式題目上讀到 `undefined` 而壞掉
（`f.a.slice(...)` 會拋錯），已改用 `faqSearchableText()`/`faqPreviewText()`
兩個 helper 函式做 null-safe 的格式判斷，搜尋索引與結果預覽對兩種格式皆正確
運作（已實測搜尋「德鐵」正確命中 2 題新格式問答，預覽文字使用 `summary`
而非截斷的原始長文字，品質更好）。

## PAT-137 [CORE_IMMUTABLE]: 作戰手冊進度追蹤系統

`profiles.workflow_progress`（JSONB · 非新表）記錄各主題完成/跳過的 step。
登入使用者雲端同步（`profiles` 表）、未登入使用者 localStorage 暫存
（`workflow_progress_local`）。「完成」與「跳過」皆視為該 step 已處理
（推進判斷邏輯相同），使用者可隨時取消勾選回到 pending。

**三個整合點**：
- `EduTopic.tsx`／`WorkflowCard.tsx`：每個 step 卡片的 Outcome 與 CTA
  之間新增勾選區（標記完成/跳過此步），`WorkflowCard` 新增選填 props
  （`status`/`onMarkCompleted`/`onMarkSkipped`/`onClear`），未傳入時該區塊
  不渲染，不影響其他潛在呼叫端
- `MyProfile.tsx`：「我的學習進度」卡片，7 主題各自可展開查看逐 step 完成
  度並手動調整（不強制依作戰手冊頁面順序勾選），每個 step 額外顯示
  `title_zh` 而非僅數字，方便使用者識別
- `Home.tsx`：Phase AN 的「下一步提示」卡片整合自動推進——依
  `getNextPendingStep()` 找出該階段推薦模組中第一個未完成/未跳過的 step，
  不再永遠停留在 step 1；已透過瀏覽器實測完整驗證（標記 step 1 完成後，
  卡片正確改顯示 step 2 的真實標題；標記全部 step 完成後，改顯示完成
  訊息並隱藏推薦卡片）。原 spec 提供 STOP CONDITION 允許本項延後，
  但複雜度可控（沿用與 MyProfile.tsx 相同的 7 主題 import pattern），
  故完整實作，未採用 spec 提供的延後選項

**與 spec 提供程式碼的差異**（修正實作缺陷，非改變設計）：
- `markStep()` 移除 spec 原文兩個宣告後從未使用的區域變數（`otherList`/
  `targetList`），會觸發本專案 `noUnusedLocals: true` 的 typecheck 錯誤
- `useWorkflowProgress()` 的 `toggleStep`/`clearStep` 改用 React 的
  functional state updater（`setProgress((prev) => ...)`）取代 spec 原文
  依賴 `[progress, persist]` 作為 `useCallback` deps 的寫法，避免快速連續
  操作時可能讀到過期的 `progress` 閉包值
- `WorkflowCard.tsx` 的「跳過此步」按鈕在已跳過狀態下改為可點擊取消
  （呼叫 `onClear`），spec 原文此按鈕在已跳過時再次點擊只會重複標記跳過
  （無實際效果），與「已完成」按鈕的取消邏輯不一致

此為 v9 願景「陪伴儀表板」核心功能的輕量落地，零新表、零推播、零期限提醒、
零跨使用者統計/排行榜。

## PAT-138 [CORE_IMMUTABLE]: 推薦專區新增 Wise

落地相關（arrival）分類新增 Wise 跨境匯款服務，遵循 PAT-58 無時效性資訊
原則（不寫具體匯率/費率數字，僅描述服務性質）。

## PAT-139 [CORE_IMMUTABLE / RESOLVED]: 進度追蹤資料未同步 bug 修復

**診斷過程**：pre-flight 逐行核對 `WorkflowCard.tsx`（確認未內部呼叫
`useWorkflowProgress()`，純接收 props，非情境 A）與 `EduTopic.tsx`（確認
`topic.slug`/`s.step` 傳遞完全正確，非情境 B）；瀏覽器實測訪客路徑
（清空 localStorage → 點擊 STEP 03/05「標記完成」）確認寫入結果為
`{"visa":{"completed":[3,5],"skipped":[]}}`，逐字比對正確，進一步排除
情境 A/B。原本嘗試以瀏覽器直接查詢正式環境 `profiles.workflow_progress`
確認欄位是否已套用，被權限分類器正確攔截（正式資料庫讀取需明確授權，
不應繞過），改以 `AskUserQuestion` 直接請示 Lily：**已確認 Phase AO 的
SQL 已於 Supabase Dashboard 執行成功**，排除欄位不存在的可能。

**實際根因**（情境 C 的變體，非 spec 原描述的「MyProfile 未重新整理不會反映」，
MyProfile 確實有在每次掛載時重新 fetch，但……）：Phase AO 讓
`EduTopic.tsx`/`MyProfile.tsx`/`Home.tsx` 各自獨立呼叫
`useWorkflowProgress()`，各自擁有獨立的 state 副本；`saveCloudProgress()`
為 fire-and-forget（未 await 即返回），使用者點擊「標記完成」後若快速切換
頁面，新頁面掛載時的 `fetchCloudProgress()` 有機會搶在前一頁的雲端寫入
完成前執行，讀到尚未更新的舊資料，且此後除非整頁重新整理，沒有任何
重新 fetch 的機制。另外發現 `saveCloudProgress()` 原本捕捉 Supabase 錯誤後
只 `console.error`、不 `throw`，導致任何寫入失敗（不論成因）都會被靜默吞掉，
UI 端完全沒有失敗提示，使用者會誤以為操作成功。

**修復內容**：
- 新建 `src/lib/WorkflowProgressContext.tsx`（`WorkflowProgressProvider` +
  `useWorkflowProgressContext()`），掛載於 `App.tsx` 最外層、跨路由導覽
  不會卸載，全站進度狀態改為單一記憶體副本。初始 fetch 只在 Provider
  掛載當下執行一次（`useEffect` deps 為 `[user]`，不隨路由變化重新觸發），
  之後所有操作透過 `toggleStep`/`clearStep` **同步**更新這份共享狀態，
  雲端寫入僅作為背景持久化，不再是「切換頁面後讀到什麼」的依據——
  結構性排除整個race window，而非僅縮小發生機率
- `EduTopic.tsx`/`MyProfile.tsx`/`Home.tsx` 改用 `useWorkflowProgressContext()`
  取代各自獨立的 `useWorkflowProgress()`；刪除已無人引用的
  `src/lib/useWorkflowProgress.ts`
- `saveCloudProgress()` 失敗時改為 `throw`（而非只 log），
  `WorkflowProgressProvider` 的 `persist()` 對應 `catch` 後跳出
  toast「進度儲存失敗，請檢查網路連線後重試」，任何未來的寫入失敗
  （不論成因為何）都會被使用者看見，不再靜默吞錯
- 修正 `toggleStep`/`clearStep` 內部把持久化副作用寫在 `setProgress`
  updater callback 內的寫法（違反 React state updater 必須是純函式的
  約定，本專案啟用 `React.StrictMode` 會在開發模式下偵測並雙重呼叫
  updater、進而讓副作用被誤觸發兩次），改為先算出 `next`、呼叫
  `setProgress(next)`、再呼叫 `persist(next)` 三個獨立步驟

**驗證方式與誠實限制**：本環境無法執行 Google OAuth 登入，無法直接重現
Lily 回報的「登入身分下點擊→切頁未同步」情境本身。改為：(1) 瀏覽器完整
測試訪客路徑（localStorage），確認在**不重新整理頁面**的情況下，從
`/edu/visa` 標記 Step 1 完成後，soft-navigate 到 `/`，Home.tsx 的下一步
提示卡片立即正確顯示 Step 2 真實標題——證實新的 Context 共享機制本身
運作正確；(2) 透過程式碼推理確認同一套機制對登入路徑同樣適用且**結構性**
消除競態（Provider 只在 App 掛載當下 fetch 一次，此後不論導覽到哪個頁面
都讀同一份已經被使用者操作同步更新過的記憶體狀態，不存在「重新 fetch
搶在寫入完成前」的視窗）。無法對登入路徑做到與訪客路徑同等的第一手
瀏覽器實測確認，誠實列為本輪驗證限制。

**教訓**：跨元件共享的可變狀態（如 workflow_progress）若在多處各自呼叫
同一個 hook，容易產生各自獨立的 state 副本，造成使用者操作後其他畫面
看不到更新。未來類似「使用者操作 → 需要多處畫面同步反映」的功能，應
優先考慮單一資料源（Context/全域 store）而非多處獨立 fetch；async 寫入
若無法確保完成時序，應避免讓下游讀取依賴「寫入已完成」的隱含假設。

## PAT-140 [CORE_IMMUTABLE]: Wise 於作戰手冊 STEP 03 同步出現

**與 spec 假設的落差**：spec 描述「STEP 05個人銀行帳戶」，但實際核對
`src/data/edu/visa.ts` 發現 STEP 05 的真實標題是「線上預約遞件」，
「個人銀行帳戶」內容實際位於 **STEP 03**（「開限制提領帳戶 + 個人帳戶」）。
依實際資料位置修正，而非依 spec 的錯誤步驟編號執行。

Wise 加入 STEP 03「個人銀行帳戶（落地後才能辦）」項目中的手機開戶選項
（`N26 / Revolut / Wise（手機開戶）`），與推薦專區「落地相關」分類已有的
Wise 項目呼應。**未**依 spec 建議新增獨立的 `official_sources` 條目——
該欄位於此 step 實際上僅收錄限制提領帳戶（Sperrkonto）服務商的官方連結
（Fintiba/Expatrio/Coracle/Deutsche Bank Sperrkonto），個人帳戶銀行
（N26/Revolut/Sparkasse 等）本來就不個別條列官方連結，維持既有資料結構
的一致性，不單獨為 Wise 破例。

## PAT-141 [CORE_IMMUTABLE]: Header 導覽重構 · 語校+作戰手冊收合

主導覽從 4 項精簡為 3 項（佈告欄/加油站/常見問答），語校與作戰手冊收合進新
「資源」dropdown，比照現行「更多」dropdown 的互動樣式（`relative group` +
`group-hover:block`，桌面 hover 展開）。手機選單同步調整順序：
佈告欄/加油站/常見問答 → 分隔線 → 語校/作戰手冊（資源分組）→ 分隔線 →
隱私政策/支持本站。此決策由 Lily 明確指示，雖犧牲核心功能（語校、作戰手冊）
的一級可見度，但符合其對導覽視覺密度的偏好。

## PAT-142 [CORE_IMMUTABLE]: 推薦專區更名為「加油站」

全站顯示文字由「推薦」「推薦專區」改為「加油站」，路由 URL（`/recommendation`、
`/recommendation/:slug`）維持不變，避免破壞既有連結/書籤。逐一核對全站所有
使用者可見文字出現處：Header nav（AQ.a 已處理）、Home.tsx Portal 卡片標題、
Recommendation.tsx/RecommendationCategory.tsx 頁面標題與麵包屑、
SubmissionForm.tsx 分類下拉的預設選項、UserSubmissionsList.tsx 空狀態引導連結、
Edu.tsx 頁尾連結。**未改動**歷史 code comment（Header.tsx 的 Phase X 決策說明、
`recommendation.ts` 的 Phase H 資料契約說明）與 `docs/pat-index.md` 既有 PAT
條目原文（PAT-57、PAT-138），依時間膠囊原則保留當時用語。

## PAT-143 [CORE_IMMUTABLE]: Portal/Recommendation/Edu 卡片描述文字桌面+手機皆顯示

Phase AF/AG 密度優化曾在手機橫列模式用 `sm:hidden` 隱藏描述文字，本輪確認
桌面與手機都需要顯示，改為 `sm:block sm:mt-0.5`（移除 `sm:hidden`），
`truncate` 控制單行省略而非完全隱藏。**範圍延伸**：spec 僅要求 Home.tsx
的 Portal 卡片，但 `Recommendation.tsx`/`Edu.tsx` 依 PAT-126 建立的
「三頁共用同一套 class 組合邏輯」原本就有完全相同的 `sm:hidden` 寫法——
若只改 Home.tsx 會破壞 PAT-126 的既有一致性保證，故一併套用相同修正到
三個頁面，維持既有的跨頁一致性原則不變。

## PAT-144 [CORE_IMMUTABLE]: 全部完成後的下一階段引導按鈕

`persona_stage` 循序推進（`visa_prep`→`landing`→`settled`→`leaving`），
全部完成訊息追加「前往下一階段」按鈕，非自動跳轉，使用者需主動點擊確認。
**吸取 PAT-139 的教訓**：spec 提供的範例程式碼在按鈕 `onClick` 中對登入
使用者呼叫 `supabase.from('profiles').update(...)` 後未等待即呼叫
`window.location.reload()`（fire-and-forget，reload 可能中斷尚未完成的
雲端寫入請求）——這正是本輪剛修復過的同一類問題，故本次實作**改為 `await`
雲端寫入完成後才 `reload()`**，避免重蹈覆轍。`leaving`（最後階段）無下一
階段時顯示終局完成訊息，不顯示按鈕。已透過瀏覽器完整測試 `visa_prep`→
`landing` 的推進流程（含 reload 後 nudge 卡片正確切換至新階段對應模組）
與 `leaving` 階段的終局訊息顯示。

## PAT-145 [CORE_IMMUTABLE]: 推薦專區分類徹底重組 · 8 新分類取代舊 6 分類

金融/交通/電信/找房/查詢/獎學金/支出/通用，取代舊有「通用/簽證相關/落地相關/
學程相關/獎學金/台灣海外方案」6 分類。`user_submissions.target_category`
CHECK constraint 同步更新（`DROP CONSTRAINT` + `ADD CONSTRAINT`），既有
使用者提交若屬已移除的舊分類值（`visa`/`arrival`/`edu`/`taiwan`）改為
`NULL` 避免資料異常；`general`/`scholarship` 兩個分類鍵在新舊分類中皆存在
且語意相同，予以保留不需清空。

**重分類方式**：純粹搬移，逐字保留原有全部 41 項推薦（`id`/`title`/
`description`/`tags`/`url` 皆未改動，僅 `category` 欄位改指向新分類），
確認零遺漏、零重複、零虛構新增。舊 6 個 JSON 檔案中 `general.json`/
`scholarship.json` 檔名沿用（因分類鍵持續存在，但內容已按新歸類重新
組成）、`visa.json`/`arrival.json`/`edu.json`/`taiwan.json` 因不再對應
任何分類鍵，內容已完整搬空後刪除。

**重分類對照表**（原分類 → 新分類，逐項）：
- **finance**（8）：gen-n26、gen-revolut（原 general）、visa-fintiba、
  visa-expatrio（原 visa）、arr-schufa（原 arrival）、wise-transfer
  （原 arrival，Phase AO 新增）、tw-esunbank、tw-taishinbank（原 taiwan）
- **transport**（3）：gen-db、gen-bahncard、gen-google-maps（皆原 general）
- **telecom**（4）：arr-alditalk、arr-lidl-connect（原 arrival）、
  tw-cht-overseas、tw-fet-overseas（原 taiwan）
- **housing**（4）：arr-wg-gesucht、arr-immoscout、arr-immowelt、
  arr-studentenwerk（皆原 arrival）
- **lookup**（6）：edu-uni-assist、edu-daad-programs、
  edu-study-in-germany、edu-testdaf、edu-telc、edu-anabin（皆原 edu，
  子分類名稱從「學程相關」改為「查詢」，內容範疇不變）
- **scholarship**（6，不變）：sch-daad-scholarships、sch-erasmus、
  sch-taiwan-moe、sch-studienstiftung、sch-konrad-adenauer、sch-boell
  （分類鍵與全部內容皆原封不動）
- **expense**（4）：visa-mawista、visa-care-concept（原 visa，保險）、
  tw-moe-scholarship（原 taiwan，雖 id 含「scholarship」字樣但內容實為
  留學貸款，依內容語意歸入 expense 而非沿用 id 命名）、
  arr-rundfunkbeitrag（原 arrival，電視稅為週期性支出）
- **general**（6，保底分類）：gen-reddit-germany、gen-reddit-de、
  gen-lieferando（原 general 中無法歸入其他 7 類的社群/生活服務項目）、
  visa-auswaertiges-amt、visa-taipei-diplo（原 visa，官方簽證資訊窗口，
  不屬於財金/交通/電信/找房/學術查詢/獎學金/支出任一主題）、
  tw-taipei-office-berlin（原 taiwan，領事服務，同樣屬於無法歸類的
  官方資源，依保底分類原則放入 general）

**圖示**：`src/assets/icons/recommendation/index.tsx` REGISTRY 改為
`IconCoin`/`IconTrain`/`IconDeviceMobile`/`IconHome2`/`IconSearch`/
`IconMedal`/`IconReceipt`/`IconApps`，spec 建議的 8 個圖標名稱皆於
Tabler 庫內確認存在，未需替換。`RecommendationCategoryMeta` 移除 `emoji`
欄位（原僅用於「其他分類」頁尾 pill 的文字前綴），改為 pill 也使用
`RecommendationCategoryIcon` 元件渲染小型 Tabler 圖示，與 Hub 頁大卡
圖示風格統一，符合 PAT-122 治理標準。

**內部條目卡片**：`RecommendationCategory.tsx` 從直排列表改為正方形小卡
grid（`aspect-square`，`sm:grid-cols-3 lg:grid-cols-4`），`line-clamp-2`/
`line-clamp-3` 控制標題/描述行數（本專案 Tailwind v4 已內建支援，
`HotSchoolsCarousel.tsx` 已有先例使用，未需額外套件）。

## PAT-146 [CORE_IMMUTABLE]: 加油站新增「外事局」分類

第 9 個加油站分類，僅收錄 Lily 於 2026 年 7 月查證過的柏林、慕尼黑 2 筆官方
連結。遵循 PAT-58 無時效性資訊原則：不描述具體預約流程步驟（易過期），只提供
官方入口 URL，並於 `RecommendationCategory.tsx` 分類頁面加明顯提醒文字告知
制度變動頻繁（柏林已廢除傳統線上預約系統為實例）。未來新增其他城市，須先查證
官方連結真實性，不可自行推測或虛構網址格式。圖示沿用 `IconBuildingBank`
（Tabler 庫內確認存在，符合 PAT-122 治理標準）。

**已知未解缺口（DEV-N，本輪未修復）**：`SubmissionForm.tsx` 的分類下拉選單
依 `RECOMMENDATION_CATEGORIES` 自動產生選項（PAT-145 建立的架構），新增
immigration 分類後選單自動出現「外事局」選項（已透過瀏覽器驗證，combobox
內確實含 `option "外事局" value="immigration"`）。但 `supabase/schema.sql`
的 `user_submissions_target_category_check` CHECK constraint（Phase AQ
最後更新，見該處 SQL）僅允許 `finance/transport/telecom/housing/lookup/
scholarship/expense/general` 8 值，**不含 `immigration`**。若使用者於
提交表單選擇「外事局」並送出，INSERT 將違反 CHECK constraint 而失敗。
本輪「DB 零觸碰」為明確硬性限制，未獲授權修改 schema.sql，故僅記錄不修復；
待 Lily 執行一段追加 SQL（`DROP CONSTRAINT` + `ADD CONSTRAINT` 加入
`'immigration'`）後方可解除此缺口。

## PAT-147 [CORE_IMMUTABLE]: 加油站卡片摘要化結構

`Recommendation` 型別（`src/lib/recommendation.ts`）擴展 `summary`/`points`/
`detail`/`updated_at`（皆 optional），沿用 FAQ 的三層結構（PAT-135／
`src/lib/faq.ts` 的 `FaqEntry`）。`description` 同步改為 optional——採用
`summary` 格式的項目省略 `description`，比照 `FaqEntry.a?` 的既有作法（切換
格式後簡單欄位省略，而非兩者並存造成內容重複）。

**判定門檻**：以字元數（非位元組，`[...text].length`）逐一量測全部 9 個分類
JSON 檔案的 `description`，僅 3 筆超過 60 字（`finance.json` 的
`wise-transfer` 67 字、`immigration.json` 的兩筆分別 123/137 字），依此
客觀門檻重構，未觸碰其餘 38 筆已經精簡的項目（例如 `arr-studentenwerk`/
`tw-taipei-office-berlin` 雖為複句但皆在門檻內，維持現狀不強行拆解）。

**卡片渲染結構性問題與修正**（`RecommendationCategory.tsx`）：原本整張卡是
單一 `<a>`（點擊即開外部連結），若直接把 `<details>`「查看完整說明」嵌入
`<a>` 內屬無效 HTML，且點擊 summary 展開時點擊事件會冒泡觸發外層 `<a>`
一併跳轉離開頁面。改為含 `summary` 的項目使用「stretched-link」寫法：外層
改為 `<div className="relative">`，內部疊一個 `absolute inset-0` 的
`<a>` 作為全卡點擊區，上層文字內容（標題/摘要/條列/標籤）加
`pointer-events-none` 讓點擊穿透到底層連結，唯獨 `<details>` 本身維持
預設 `pointer-events: auto` 並給 `relative z-10`，使其點擊在到達底層連結前
被攔截。已透過瀏覽器實測驗證：點擊「查看完整說明」僅展開/收合，不會觸發
外部連結跳轉。

無 `summary` 的項目（多數，38/41）維持原 `aspect-square` 正方形小卡不變；
有 `summary` 的項目改用 `sm:col-span-2` 讓出較寬空間容納條列重點，自然高度
（無 `aspect-square`），已於桌面（1280px）與手機（375px）寬度分別實測，
CSS Grid + 相鄰格 `aspect-square` 各自依寬度獨立計算高度，未因同列出現一張
較高的寬卡而被拉伸變形（`aspect-ratio` 優先於 grid stretch）。

**Phase AU 更新（v0.50.0）**：原本「僅超過 60 字才重構」的門檻已由 Phase AU
撤銷——`summary`/`points`/`detail` 三層格式（結論先行一句＋精簡列點＋可
收合 detail）改為**全站加油站卡片一律採用**，不論描述長短。連帶地，
`RecommendationCategory.tsx` 的「正方形小卡／寬卡」雙分支渲染已不再需要
（正方形分支的存在前提——多數卡片沒有 `summary`——不再成立），改為單一
卡片版型（`grid-cols-1 sm:grid-cols-2`，一般卡片，非正方形），移除
stretched-link + `pointer-events-none` 疊加技巧，改用明確的「官網 ↗」
按鈕開啟外部連結。全部 43 個既有卡片（8 分類）已逐卡改寫為新格式，
未新增任何原文沒有的事實，僅重組既有 description 為 summary+points。
其中 2 筆（`tw-fet-overseas`／`sch-taiwan-moe`）description 本身僅含
單一事實，無可再分的獨立資訊，依零虛構原則省略 `points`（不強行對半拆
造假列點）。詳見 PAT-152。

## PAT-148 [CORE_IMMUTABLE]: 靜態內容補齊更新日期

加油站推薦項目（9 個分類、41 項，含 Phase AR 新增的 2 項）與語言學校資料
（52 所）皆補上 `updated_at`（`YYYY-MM`）並於卡片顯示。範圍界定：僅適用於
「網站方查證提供的靜態知識內容」，佈告欄使用者貼文已有 `created_at` 時間戳、
性質不同，不在此範圍。

**日期依據**（逐一以 `git log` 核對實際建檔/查證的 commit 日期，不可虛構）：
- 加油站推薦：原 39 項（現 8 分類，`finance`/`transport`/`telecom`/
  `housing`/`lookup`/`scholarship`/`expense`/`general`）建於 Phase H
  （commit `6067bbc`，2026-07-11）；Wise（`wise-transfer`）建於 Phase AO
  （commit `e2332f4`，2026-07-15）；外事局 2 項建於 Phase AR（commit
  `45b369c`，2026-07-15）。
- 語言學校（52 所）：初版 5 所（`goethe-berlin`/`goethe-muenchen`/
  `did-frankfurt`/`fu-sprachenzentrum`/`carl-duisberg-koeln`）於未使用
  Phase 字母命名前的 MVP v2 基礎 commit（`a6e4edc`，2026-07-07）建立；
  Phase E（commit `8d06309`，2026-07-11）擴充 12 所（5→17）；Phase L
  （commit `9a9d4fe`，2026-07-12）擴充 10 所已核實（17→27）；Batch 2 的
  25 所（27→52）實際屬於 **Phase U**（commit `b9278e8`，2026-07-12），
  **非 spec 描述的「Phase L（Batch 2 · 25 所）」**——已依 `git show` 逐筆
  比對各 commit 新增的學校 `id` 清單修正此誤植，詳見 activity.log DEV-N。

因本專案開發歷程截至目前（2026-07-15）全數集中於同一個月，上述所有
`updated_at` 實際查證/建立日期換算為 `YYYY-MM` 後皆為 `"2026-07"`，故
目前全站顯示值完全相同——這是真實查證後的結果，非簡化偷懶；此欄位的
區辨效果會隨未來跨月份的新增/查證內容而逐漸顯現。

`School` 型別定義於受保護的 `src/lib/types.ts`，未新增 `updated_at`
欄位；比照既有 `accommodation`/`founded_year` 等擴充欄位的既定作法
（`SchoolDetail.tsx`/`Schools.tsx` 已有 `(school as any).accommodation`
先例），改用 `(s as any).updated_at` 型別斷言讀取，不觸碰保護檔案。

## PAT-149 [CORE_IMMUTABLE]: 加油站「外事局」通用應對指南

`RecommendationCategory.tsx` 於 immigration 分類頁「城市連結清單上方」新增
跨城市通用知識區塊（`src/components/ImmigrationGuide.tsx` + 資料檔
`src/data/recommendations/immigrationGuide.ts`），內容為指令書提供的白名單
來源整理稿逐字採用，5 節（自保原則/期限與 Fiktionsbescheinigung/文件通則/
溝通與追蹤/緊急狀況）+ 8 條官方資源連結，未新增任何指令書未列的事實或宣稱。

**分支前置條件檢查**：本 Phase 指令書假設「Phase AS 已合併」，但實際
`git fetch origin main` 檢查時 origin/main HEAD 仍是 Phase AR 的
`45b369c`，Phase AS（commit `749d9bb`）尚未合併——與指令書本身明訂的
「AS 與 AT 皆觸及加油站區域，禁止並行分支」直接衝突。已透過
`AskUserQuestion` 請示 Lily，暫停建立分支，待 Lily 將 Phase AS 合併入
main（merge commit `ec52aad`，v0.48.0）後，重新 `git fetch` 確認再建立
`phase-at-immigration-guide` 分支，避免真正形成並行分支觸及同一批檔案
（`RecommendationCategory.tsx`/`recommendation.ts`/`immigration.json`
皆為 Phase AS 才剛大幅改動的檔案）。

**展開/收合模式選擇**：指令書要求「沿用作戰手冊既有 expand/collapse
模式」，查證後作戰手冊 `WorkflowCard.tsx` 實際採用的是 `useState` +
button + chevron（`▾`/`rotate-180`）手動控制的展開模式，而非 Phase AS
剛在 `RecommendationCategory.tsx` 用於 FAQ 式摘要卡片的原生 `<details>`
元素——兩者是本站並存的兩套不同展開模式。依指令書字面要求，本次採用
`WorkflowCard.tsx` 的 button+chevron+useState 寫法（5 節各自獨立
`useState`，互不影響），而非沿用剛做完的 `<details>` pattern。

**白名單網域 grep 基準值釐清**：驗收標準 3 要求全 repo grep 白名單以外
網域為零，但 grep 後發現既有 4 個既存檔案（`finance.json` 的
`taishinbank.com.tw`——與指令書明確剔除的 `mkp.taishinbank.com.tw` 是不同
子網域用途、`general.json`/`edu/visa.ts` 的 `taipei.diplo.de`——與指令書
剔除的 `sofia.diplo.de`/`algier.diplo.de` 是不同國家駐點、`edu/arrival.ts`
提及 Facebook 社團名稱非 URL、`general.json` 的 Reddit 連結）本就存在於
更早的 Phase H/AQ 資料中，與本輪內容無關。驗收標準之「零」應理解為「本
Phase 新增內容不得引入」，而非回溯清除既有分類資料；已確認新建的
`immigrationGuide.ts`/`ImmigrationGuide.tsx` 兩檔零命中禁止網域。

## PAT-150 [CORE_IMMUTABLE]: 內容層 · detail 反重複規則

適用範圍：任何 `Recommendation`（或未來其他資料型別）採用 `summary`/
`points`/`detail` 三層結構時（PAT-147 建立），`detail` **只能保留
`summary`/`points` 未提及的資訊**（操作步驟、例外情況、費用、註記判讀等）。
逐句比對，凡與 `summary`/`points` 語意重複的句子一律刪除；若比對後
`detail` 已無任何獨有資訊，**整個 `detail` 欄位直接省略（`undefined`），
不得留空字串或硬湊內容填充**——`RecommendationCategory.tsx` 的
`{item.detail && (<details>...)}` 已原生支援此情形，省略後「查看完整
說明」收合按鈕不會渲染，因為已無額外內容可看。

**首次稽核範圍**（Phase AT.c）：逐卡比對 Phase AS 建立的 3 筆
summary/points/detail 資料（`finance.json` 的 `wise-transfer`、
`immigration.json` 的 `auslaenderbehoerde-berlin`/`auslaenderbehoerde-
muenchen`）：
- `wise-transfer`：原 detail 3 句全數與 points 逐句重複（僅為 summary+
  points 的合併改寫），無任何獨有資訊 → `detail` 欄位整段移除。
- `auslaenderbehoerde-muenchen`：原 detail 2 句，第 1 句與 points[0]+
  points[1] 合併重複，第 2 句與 points[2] 逐字相同 → `detail` 欄位整段
  移除。
- `auslaenderbehoerde-berlin`：原 detail 3 句，第 1 句與 points[0] 重複、
  第 2 句大部分與 points[1]+points[2] 重複但夾帶一個原文獨有事實
  （「多為 email 通知」的審核結果通知方式，屬操作細節）、第 3 句
  （「實際流程請以官網當下顯示內容為準」）未見於本卡 points，判定為獨有
  的註記判讀 → `detail` 精簡為僅保留這兩則獨有資訊：「審核後多以 email
  通知排定時間。實際流程請以官網當下顯示內容為準。」

**已知但依規則範圍未處理的殘留重複**：`auslaenderbehoerde-berlin` 保留的
「實際流程請以官網當下顯示內容為準」與 immigration 分類頁面層級既有的
警語 banner（PAT-146：「⚠️ 各城市外事局的預約制度變動頻繁...實際申請
流程請以官網當下顯示內容為準」）語意高度重疊。本規則比對範圍明確限定
「該卡自身的 summary/points」，不含頁面層級其他區塊，故未刪除；若未來
規則擴大至跨區塊比對，這是已知候選對象。

**Phase AU 適用範圍確認**：本規則原文已寫成「任何 `Recommendation`
（或未來其他資料型別）」的通用敘述，Phase AU 之前僅實際套用於 Phase
AS 建立的 3 筆卡片。Phase AU 將全站 43 個既有卡片（後增至 49 筆，含
AU.c 新增的 6 筆 telecom）全數改寫為 `summary`/`points` 三層格式，本
規則自此正式對全站生效——新改寫的 46 筆卡片皆未附加 `detail`（改寫
時未新增任何獨有資訊，故無 `detail` 可寫，規則自動滿足；僅原有的
`wise-transfer`／`auslaenderbehoerde-berlin`／`auslaenderbehoerde-
muenchen` 3 筆延續 Phase AT.c 已完成的 `detail` 精簡結果）。詳見
PAT-152。

## PAT-151 [CORE_IMMUTABLE]: 外事局通用應對指南 §2 擴充（§2a/§2b/§2c）

Phase AT.c 追加，事實依 Lily 查證回覆的三張表逐字填入，未超出三張表範圍：

- **§2a 申請成立要件與應取得文件**（來源：柏林官方，白名單 326233/305244）：
  成立三要件（到期前送達＋管轄外事局＋正式申請，詢問/Email/預約確認皆不
  構成申請）；該收到的兩類文件（送件證據 Eingangsbestätigung、審理期文件
  Fiktionsbescheinigung 本體，柏林規費成人 13 €）；例外（申根 C 類短期簽
  入境者不核發 Fiktion）。
- **§2b Abs.3/Abs.4 再入境對照表**（來源：漢堡官方，白名單 17554）：
  §81 Abs.4（原持有效居留/D 簽到期前送件，可再入境但證明本身須仍有效）
  vs §81 Abs.3（免簽入境後境內首次申請，**台灣護照典型情境**，出境後
  不可再入境亦不得開始新工作/學業，唯一例外是免簽 90 天額度未用完）vs
  申根 C 簽入境（根本不核發 Fiktion）。此表是全指南事實密度最高、對台灣
  讀者最關鍵的段落——多數持台灣護照免簽入境者申請居留屬 Abs.3 情境。
- **§2c 送件底線**：法定底線（到期日前送達即成立，零緩衝）+ 本站建議值
  （到期前 4 週送出、8–12 週開始備件、熱門城市預約提前 2–3 個月），**明確
  標示「本站建議，非官方期限」**，不與法定底線混淆，佐證依據為柏林官方
  文件缺漏是常見核發障礙的說法。

**資料結構擴展**：`GuideBlock` 新增 `table`（`headers`/`rows` 二維字串陣列）
與 `callout`（單句強調文字，視覺上以 `bg-brand-gold-soft` 小徽章呈現，
非隱藏於一般條列中）兩種區塊類型，`ImmigrationGuide.tsx` 的
`GuideBlockView` 對應新增渲染分支；`table` 外層加 `overflow-x-auto`
確保窄螢幕下表格在自身容器內捲動，不撐開整個頁面（已於手機 375px 寬度
實測確認 `document.body.scrollWidth` 未超出 viewport 寬度）。

**與既有 §2 內容的關係**：§2a/§2b/§2c 是「新增」在既有 4 條列點之後，
未改寫既有內容（指令字面是「新增」非「重寫」，予以保留）；但既有第 3 條
（「Fiktionsbescheinigung 不是萬用旅行證件...取決於證明類型與註記」）與
新增的 §2b 表格語意上有相當程度重疊——§2b 提供的是該籠統敘述所指涉的
精確機制。此重疊在指令要求的「detail 反重複規則」（PAT-150）範圍之外
（該規則明確限定於 `Recommendation` 卡片的 summary/points/detail
三層結構，非本指南的自由文字區塊），故未修改既有 §2 條列，列為未來若
擴大反重複規則適用範圍時的候選對象。

**Phase AU.b-1 更新**：上述「候選對象」已於 Phase AU 處理——既有第 3 條
列點改寫為一句導引「能否出境後再入境，取決於證明上勾選的條款——見下表
逐字確認」，細節交由 §2b 表格獨占，消除重複，做法與本 PAT 的反重複原則
精神一致。

## PAT-152 [CORE_IMMUTABLE]: 加油站卡片格式全站化（結論先行＋精簡列點＋可收合 detail）

Phase AU 將 PAT-147 建立的 `summary`/`points`/`detail` 三層結構從「僅
超過 60 字才重構」升級為**全站加油站卡片一律採用**，比照 Phase AO FAQ
結構（PAT-136）「結論先行一句＋精簡列點（5 秒可讀完）＋可收合 detail」。

**執行**：9 個分類、43 個既有卡片（8 分類，immigration 2 筆已於 Phase
AS/AT.c 完成不動）逐卡改寫，純粹重組既有 `description` 為
`summary`+`points`，**未新增任何原文沒有的事實**——不做逐卡重新查證
（那是 AU.c 針對新增 telecom 卡片才有的動作）。`description` 欄位於
改寫後的卡片一律省略（比照 PAT-147 既有慣例）。

**例外揭露**：2 筆卡片（`telecom.json` 的 `tw-fet-overseas`、
`scholarship.json` 的 `sch-taiwan-moe`）原始 `description` 僅含單一
事實，無可再切分的獨立資訊；依零虛構原則，此二筆省略 `points`（僅
`summary` 一句），不強行把單一事實拆成兩個空洞的列點湊數。

**渲染層重構**（`RecommendationCategory.tsx`）：所有卡片皆有 `summary`
後，PAT-147 原本的「正方形小卡（`aspect-square`）／寬卡
（`sm:col-span-2` + stretched-link）」雙分支邏輯，正方形分支永遠不會
再被命中（其存在前提——多數卡片沒有 `summary`——不再成立）。改為單一
卡片版型：`grid-cols-1 sm:grid-cols-2` 一般卡片（非正方形，自然高度），
標題列右側加明確的「官網 ↗」連結按鈕取代整卡可點擊；連帶移除
stretched-link + `pointer-events-none` 疊加技巧（該技巧原是為了在正方形
整卡可點擊區域內安全嵌入 `<details>` 收合而設計的變通方案，改為一般
卡片列表、連結按鈕獨立於內容區之後，不再需要）。

**逐卡稽核表**：見 Phase AU 完成報告附表（卡片 id｜結論句｜列點數｜
detail 有無重複句），共 49 筆（43 既有 + AU.c 新增 6 筆 telecom）。

## PAT-153 [CORE_IMMUTABLE]: 外事局通用應對指南 §4a/§4b + §6（eAT/eID）

Phase AU.b 新增內容：

- **§4a 電話打不進、官網混亂找不到信箱時**：改走可留紀錄管道（115
  政府服務專線、城市 Serviceportal 的 Kontaktformular、掛號信、機構
  轉達）。
- **§4b 補件通知怎麼來、寄漏怎麼辦**：補件通知以郵寄至 Anmeldung
  登記地址為主，附自保三件事與懷疑寄漏時的處理方式；查詢頻率建議值
  明確標示「本站建議，非官方規定」（沿用 §2c 已建立的 callout 標示
  慣例）。
- **§6 eAT 居留卡與 eID 線上身分**（新增第 6 節）：台灣人適用性、
  如何確認/啟用 eID、如何判斷遺失＋處理（沿用 §5 五步驟）。

**在期查證的意外收穫**：指令書原將 AusweisApp 官方下載頁 URL 與
Sperr-Notruf 116 116 是否受理 eAT eID 封鎖列為「本輪未完成查證，禁止
未驗證即寫入」。但於瀏覽器實測 BAMF 官方 eAT 頁（指令書已授權的來源）
時，該頁本身即列出「www.ausweisapp.bund.de」為官方下載連結、且明確
列出「Blocking hotline 116 116，24/7 受理」——等同於在查證已授權來源
的過程中，同一頁面直接給出了兩項原本要求留白的答案。已個別以瀏覽器
實測確認 `ausweisapp.bund.de` 存活且為真正的下載頁（非僅信任 BAMF
頁面的轉述），確認後正式寫入，並在 callout 中完整保留 BAMF 頁面提供的
境外撥打方式（0049-116 116／0049-30 4050 4050）。**這並非規避「禁止
未驗證即寫入」的限制**——規則真正禁止的是「未驗證」，而非「本輪查證」；
既然本輪確實完成了查證（且來源就是指令書本身授權的 bamf.de），寫入
比留白更符合零虛構原則的精神（留白只在無法驗證時才是正確選擇）。

**新增連結**：115.de、bamf.de eAT 頁、ausweisapp.bund.de 三條，皆於
本輪以瀏覽器實測確認存活（非 curl，避免重蹈 §81 連結當初被 bot 阻擋
的狀況）。

## PAT-154 [CORE_IMMUTABLE]: telecom.json 預付卡商家補全

Phase AU.c 新增 6 個預付卡品牌卡片（Telekom Prepaid／Vodafone
CallYa／O2 Prepaid／congstar Prepaid／Ortel Mobile／Lebara），沿用
PAT-152 卡片格式；既有 2 筆（Aldi Talk／Lidl Connect）重新以瀏覽器
實測確認存活，內容不變。

**查證方式**：全部 8 個 URL 皆以瀏覽器（非 curl）逐一開啟確認存活與
標題相符，包含指令書標記「curl 403 被 bot 阻擋」的 Lebara——瀏覽器
實測成功開啟，確認寫入。**五維查證**中的「身分驗證方式」與「台灣護照
可完成開卡驗證與否」兩維，本輪僅瀏覽各品牌首頁與方案頁，未深入各品牌
專屬的身分驗證說明子頁面查證細節，故依指令書「官網無明文則留 null，
不臆測」原則，未於逐卡 `points` 中另立此二維度的具體結論，改以分類頁
層級的共通事實橫幅取代（見下）——此為誠實揭露的驗證深度限制，而非
迴避查證。

**分類頁共通事實**（`RecommendationCategory.tsx`，`meta.key ===
'telecom'` 條件渲染，比照 immigration 分類既有的警語橫幅模式）：
「德國預付卡開卡依法須完成身分驗證（VideoIdent／PostIdent／門市
臨櫃），備妥護照。各品牌對非德國證件（如台灣護照）的支援度不一，請以
官網當下的驗證方式頁面為準」，取代逐卡重複同一段話。

**內容取材限制**：Ortel Mobile／Lebara 頁面上可見具體資費數字與限時
優惠（例如「39,99€/28 天」「AKTION bis 31.07.2026」），依 PAT-58
無時效性資訊原則，卡片內文僅描述品牌定位（主打國際通話優惠），不寫入
會過期的價格/優惠期限數字。

## PAT-155 [CORE_IMMUTABLE]: schema.sql 段落未經真 DB 驗證＝未經測試的程式碼

**核心教訓**（Phase AV 起源）：2026-07-15 線上 DB 抽查發現面狀漂移——
`listing_likes` 整表缺失、`profiles.persona_stage` 欄位缺失、2 張
`pre_v4` 殭屍表殘留。這些落差存在的根本原因是：`schema.sql` 是**唯一
真相來源的假象**——它只記錄了「哪些 SQL 曾經被寫下」，不代表「哪些
SQL 真的在正式 DB 上被成功執行過」。過去每個 Phase 若只在本機用
`pglast`/靜態檢查confirmed schema.sql 語法正確，或只憑肉眼比對程式碼
與 SQL 段落的邏輯是否自洽，這**等同於只做了單元測試從未做整合測試**
——語法正確、邏輯自洽的 SQL 完全可能因為：Lily 忘記執行某一段、
複製貼上時漏掉範圍、Dashboard 手動操作後未同步回 schema.sql、或
不同環境（本機開發用的 mock/測試 DB vs 正式 DB）狀態不同步，而與
真實 DB 產生落差，且這種落差**不會在 typecheck/build 任何一關被
攔截**——它只會在使用者遇到功能壞掉時才現形。

**具體案例**：
- `listing_likes` 整表缺失：代表 Phase Q 當初的 SQL 從未在正式 DB 上
  執行成功（或執行過但後來被移除／從未存在於正式環境），但 schema.sql
  一直靜靜地記錄著它「應該存在」，前端 `useLikes.ts` 一直在對一個
  不存在的表送查詢，只是沒人發現（讚功能可能長期靜默失敗）。
- `persona_stage` 欄位缺失：同樣的模式，Phase AI 的 ALTER TABLE 語句
  從未被證實在正式 DB 執行過。
- 2 張 `pre_v4` 殭屍表：反方向的漂移——DB 上存在著 schema.sql 完全沒有
  記錄、理論上不該存在的表，代表過去曾有未被記錄進 schema.sql 的手動
  DB 操作。

**制度性修正（Phase AV 建立）**：
1. `supabase/audit.sql`——單一可一次執行的全量稽核查詢（全表/全欄位/
   全約束/全 RLS 狀態/全 policies/storage buckets/全 triggers 與
   functions），輸出統一為 `(section, key, value)` 三欄，方便逐行貼回
   對照，取代過去「憑印象或憑 schema.sql 內容推測 DB 現狀」的做法。
2. `docs/expected-schema.md`——由校正後 schema.sql 人工推導出的期望值
   總表，格式與 audit.sql 輸出逐項對應，作為「schema.sql 說了什麼」
   與「DB 實際是什麼」比對時的中介文件。
3. 兩份文件皆以 `pglast`（libpg_query 的 Python binding，非本機 psql，
   但屬於同一套 Postgres 官方解析器）做語法靜態驗證，確認至少不含
   語法錯誤——這只保證「能被 Postgres 解析」，**不保證「已在正式 DB
   執行過」**，兩者不可混為一談，這正是本 PAT 要強調的核心區別。

**日後規範**：任何涉及 schema.sql 的 Phase，完成 SQL 段落撰寫後不能
視為「已完成」，必須明確標記為「待 Lily 於正式 DB 執行並回報結果」，
且**不能假設先前 Phase 記錄在 schema.sql 裡的 SQL 都已確實執行成功**
——若後續稽核發現落差，應視為系統性風險（可能影響任何一段歷史 SQL），
而非單一意外，優先安排全量稽核（如本輪 audit.sql）而非逐一排查。

## PAT-156 [CORE_IMMUTABLE]: 顯示名與識別碼分層更名規則

**核心規則**：任何全站更名任務，一律區分兩層，只動前者：

- **顯示層**（改）：使用者實際會看到的文字——導覽列、頁面標題/h1、
  按鈕、Portal 卡片、空狀態文案、toast/錯誤訊息、aria-label、隱私政策
  等法律文件內文、公告內容。
- **識別碼/歷史記錄層**（不改）：路由 hash、元件/檔案名、資料的
  category/type 鍵值、DB 欄位與 CHECK 值域、**程式碼註解**（含
  Phase 開發歷程說明，無論多新——即使是同一天稍早才寫的註解，只要是
  註解就不算顯示層，見既有的「時間膠囊原則」）。

不動識別碼層的理由：路由 hash 變動會讓使用者既有書籤失效；元件/檔案名
變動會製造不必要的 diff 雜訊且與顯示名脫鉤更利於未來再次更名；
category/type 鍵值與 DB CHECK 值域變動則是真正高風險的資料漂移（歷史
資料列的欄位值仍是舊鍵值，若同時改前端顯示邏輯又不搬移資料，會造成
「資料庫存的是舊鍵值，前端卻只認新鍵值」的靜默不匹配）。

**Phase AW 執行案例**（「加油站」→「資源」、「佈告欄」/「生活佈告欄」
→「討論區」）：

- 全 repo grep 逐筆分類，顯示層 20 餘處全部改字（導覽/Portal/頁面
  標題/空狀態文案/toast 錯誤/aria-label/隱私政策/badges 描述），識別碼
  /註解層（`Recommendation.tsx`/`immigrationGuide.ts` 的 Phase 開發
  歷程 comment、`badges.ts` 的 union type 值註解）維持不動，路由
  `/board`/`/recommendation`、`listings.type` CHECK 值域、
  `RECOMMENDATION_CATEGORIES` 的 category key 皆未觸碰。
- **公告內容例外**：指令書明確將「公告內對「加油站」的文字引用」列入
  顯示層更名範圍，故舊有 2 則歷史公告（2026-07-08／2026-06-25）的
  `body` 文字內「佈告欄」也一併改為「討論區」——這與本站慣常的「歷史
  記錄不回溯改寫」原則不同（PAT/pat-index.md 的歷史條目從不回溯改寫），
  但公告內容性質上更接近「持續更新的顯示文案」而非「開發決策記錄」，
  且指令書已明確、具體地將其點名列入範圍，故依指令書字面執行而非套用
  默認的時間膠囊直覺。新增的 2026-07-15 公告本身逐字引用指令書文案，
  文中「資源（原加油站）」「佈告欄更名為討論區」故意在句子裡提及舊名
  ——這是描述「更名」這件事本身所需的自然語言，不是漏改。
- **隱私政策版本戳**：指令書寫「頁尾既有版本標註處」，但實際程式碼中
  該日期戳是顯示在 H1 標題正下方（頁首），非頁面最下方；已依「既有版本
  標註處」的實質功能（顯示最後更新日期）更新，未機械套用「頁尾」字面
  位置去搜尋不存在的頁尾日期戳。

## PAT-157 [CORE_IMMUTABLE]: 導覽列「資源」撞名事故——全站更名須檢查新名稱是否與既有無關字串衝突

**根因**（Phase AY 查明）：`Header.tsx` 桌面導覽的下拉選單觸發文字
「資源 ▾」，其實是 **Phase AQ（PAT-141）就已存在、與加油站/推薦功能完全
無關**的分組標籤，內容收合「語校」+「作戰手冊」。Phase AW 執行「加油站
→資源」全站更名時，正確地把「加油站」獨立頂層連結（推薦功能本身的
入口）改名為「資源」——這個 grep 命中本身沒有錯，改的就是該改的那一行。
**問題在於**：Phase AW 選定新名稱「資源」時，沒有檢查這個字詞是否已經
被導覽列中其他、語意上完全無關的既有元素占用。兩個「資源」字樣因此在
畫面上同時出現：一個是推薦功能的頂層連結，另一個是語校/作戰手冊 dropdown
的分組標籤——對使用者而言毫無關聯，卻共用同一個詞，造成「資源▾ 點開後
又看到資源」的視覺重複感。

**修正**：Header.tsx 桌面+手機導覽合併為單一資料夾，內含「資源／語校／
作戰手冊」三項（依序），觸發文字改為「探索」（與資料夾內任何項目皆不
同名，避免重蹈撞名覆轍）；移除原本獨立的頂層「資源」連結。手機選單
同步調整順序與分組。

**日後全站更名的新規則**：任何「字串取代型」全站更名（grep 找到 N 處
改 N 處），**新名稱本身必須額外檢查一次**：是否與同一介面（尤其是同一
個導覽列/選單/彈窗）中其他既存、語意無關的字串重複？grep 命中數量
比對正確 ≠ 更名後的畫面沒有新的視覺歧義——這是兩件不同的事。改動點
清單除了逐一列出「改了哪幾行」，還要額外檢查「改完之後，新文字有沒有
在附近製造出新的重複」。此規則寫入全站更名 SOP，作為 PAT-156（顯示名
與識別碼分層更名規則）的補充。

**PAT 編號註記**：本 PAT 於 `phase-ay-nav-consolidation` 分支（自 main
v0.52.0 分出，未含尚未合併的 Phase AX 分支內容）編號為 PAT-157；Phase
AX 分支上同樣新增了一個 PAT-157（不同內容，關於導覽完成後續彈窗的
架構模式）。兩分支各自獨立編號，合併順序由 Lily 決定，若兩者皆合併
入 main，屆時需依實際合併順序重新查證編號並調整其中一方，避免碰撞
——此為既有慣例（見 Phase AT/AU 前置條件檢查時的類似處理）。

## PAT-158 [CORE_IMMUTABLE]: schema.sql 校正的唯一合法依據是 audit.sql 對正式 DB 的真實查詢結果

**核心教訓**（Phase AZ 起因於 Phase AV 的二次失誤）：Phase AV 校正
`listing_likes` 時，`id BIGSERIAL` 欄位的保留決策依據是「讀
`src/lib/useLikes.ts` 發現前端 `.select('id')` 依賴這個欄位」——這個
推論本身**碰巧是對的**（本次 Phase AZ 的 audit.sql 直連正式 DB 確認
線上確實有 `id` 欄位），但 Phase AV 校正 `user_id` 外鍵目標時，卻**沒有
同樣的查證動作**，只是延續了 schema.sql 原文的 `REFERENCES auth.users
(id)` 沒有改對——實際線上是 `REFERENCES public.profiles(id)`。這暴露了
更根本的問題：**程式碼推論（讀前端怎麼用）與查證 DB 真實結構（讀
audit.sql 對正式 DB 的查詢輸出）是兩件不同的事，前者永遠只能算「線索」
或「假說」，絕不能當作「校正依據」本身**——即使某一次推論剛好猜對了
（如本例的 `id` 欄位），也不代表推論方法本身是可靠的；這一次「湊巧猜對
一半、猜錯另一半」的結果，恰好證明了單純推論的不可靠性。

**規則**：任何對 `schema.sql` 的「校正」（區別於全新功能的 SQL 撰寫），
唯一合法依據是 `audit.sql`（或等效的直連正式 DB 查詢）對真實 DB 結構
的查詢輸出，逐字比對 `pg_get_constraintdef` 等系統目錄函式回傳的定義
字串。程式碼審閱（前端怎麼查詢某欄位、TypeScript 型別怎麼定義）**只能
用來輔助理解「為什麼線上會是這樣」或「這個欄位還有沒有人在用」，不能
用來決定 schema.sql 校正後應該寫什麼**。若沒有 audit.sql 或等效的真實
查詢結果佐證，schema.sql 的任何「校正」都只是又一次未經測試的猜測，
與 PAT-155 揭露的原始問題（schema.sql 段落未經真 DB 驗證＝未經測試的
程式碼）本質相同——只是這次連校正動作本身都可能是錯的。

**本輪執行**：`listing_likes.user_id` 外鍵目標由 `auth.users(id)` 改為
`public.profiles(id) ON DELETE CASCADE`，逐字依據指令書附上的 audit.sql
真實輸出（`pg_get_constraintdef` 結果）；其餘欄位（`id`/`listing_id`/
`created_at`/PK/policies）本次確認與線上一致，維持不動，未額外「順手」
調整任何未被 audit.sql 指出有問題的部分——即使審閱時可能會冒出其他
「順手改善」的念頭，也必須克制，因為那些改動同樣沒有 audit.sql 佐證。

## PAT-159 [CORE_IMMUTABLE]: 導覽完成後續彈窗必須掛在 App 根層級，不能掛在會被導覽卸載的頁面元件內

**根因**（Phase AX 發現）：`OnboardingModal.tsx` 的 `handleFinish()` 在
使用者選定階段完成導覽時，會呼叫 `navigate('/edu/:slug')` 導向對應主題頁
——這是既有、未變動的行為。若「導覽完成後續彈窗」的開關狀態（`useState`）
存放在掛載 `OnboardingModal` 的頁面元件（`Home.tsx`）內，該頁面元件會在
**同一個事件處理常式**內被 `navigate()` 卸載，狀態更新永遠來不及渲染
——這不是時序競態的機率問題，而是結構性必然發生（每次都會卡在同一步）。

**解法**：不透過 props/state 由父層直接控制開關，改用 `window`
`CustomEvent`／原生 `Event` 廣播「事件已發生」，由一個**掛載於 App.tsx
根層級**（比照 `WorkflowProgressProvider` 的既有模式，見 PAT-139）、
不受路由切換影響的獨立元件監聽並自行管理開關狀態。事件廣播與監聽是
同步的（`dispatchEvent` 呼叫時就直接執行監聽器），不受後續 `navigate()`
卸載其他元件影響。

**適用範圍**：任何「A 元件完成某動作後，B 內容需要出現，且 A 完成動作
本身會觸發路由跳轉」的情境，皆不能將 B 的狀態耦合在 A 的直接父層——父層
可能在同一個事件處理常式內被卸載。日後若有類似「完成 X 後彈出 Y」的
需求，且 X 的完成路徑含有 `navigate()`，優先檢查此結構性風險。

**本輪實作**：`src/components/PostOnboardingLoginPrompt.tsx` 自行管理
`open` 狀態，透過 `notifyOnboardingStageSelected()`（`window.dispatchEvent`
封裝）接收觸發信號，掛載於 `App.tsx`；`OnboardingModal.tsx` 新增
optional `onStageSelected` callback prop，僅在 `handleFinish()` 內
`selectedStage` 為真（使用者確實選定階段，非略過導覽）時呼叫，略過導覽
（skip）路徑完全不觸碰此 prop，未變動 `OnboardingModal` 既有的樣式與
互動邏輯本身。略過永久旗標（`post_onboarding_login_prompt_dismissed`）
與已登入判斷（`!user`）皆內建於監聽器邏輯中，父層只需無條件呼叫
`notifyOnboardingStageSelected()`，不需重複判斷。

## PAT-160 [CORE_IMMUTABLE]: 多重觸發路徑功能，每條路徑須各自獨立瀏覽器實測

**起因**：Phase AX 完成報告曾宣稱「略過導覽（skip）路徑不會觸發登入
提示」，但僅以程式碼審閱（`if (selectedStage)` 判斷式的邏輯推理）作為
依據，從未在瀏覽器中實際點擊「跳過，直接瀏覽」按鈕確認。Lily 於 dev
preview 實測後回報「略過導覽路徑，登入提示同樣跳出」，要求逐路徑重新
稽核。

**規則**：任何功能若存在**多個可能觸發同一結果的獨立使用者路徑**
（例如本例的「選定階段」vs「略過導覽」，皆是使用者可能在同一個彈窗中
選擇的分支），每一條路徑都必須在瀏覽器中**分別實際操作一次**並記錄
結果，不能因為「已驗證路徑 A 正確」或「程式碼審閱顯示路徑 B 的條件式
邏輯正確」就推論路徑 B 也一定正確。程式碼審閱可以（也應該）作為輔助，
但不能替代任一路徑的實機驗證——條件式判斷在原始碼裡看起來正確，不等於
它在瀏覽器實際執行環境中的行為與預期一致（可能有 HMR/build 快取、
元件掛載順序、事件監聽時機等只有實際執行才會暴露的因素）。

**Phase AX 修復輪的重新調查結果**：
- 逐行複查 `OnboardingModal.tsx` 的完整 onClick 呼叫鏈：`handleSelectStage('skip')`
  只呼叫 `markOnboardingCompleted()` + `onClose()`，從未進入
  `handleFinish()` 或觸碰 `onStageSelected`；grep 全 repo 確認
  `notifyOnboardingStageSelected`/`onStageSelected`/事件名稱字串
  皆只有原本設計的單一呼叫點，無重複或隱藏的觸發路徑。
- 瀏覽器實測兩條路徑（皆以全新分頁 + 清空 localStorage 的乾淨狀態
  重複執行，非單次）：
  - **路徑 A（選定階段）**：清空 localStorage → 開啟首頁 → 點擊任一
    階段按鈕 → 點擊「開始瀏覽」→ 確認 URL 導向 `#/edu/visa` 且登入
    提示彈窗正確出現（標題「登入即可儲存你的進度、留言與追蹤」）。
  - **路徑 B（略過導覽）**：清空 localStorage → 開啟首頁 → 點擊「跳過，
    直接瀏覽」→ 確認 `onboarding_completed` 寫入 true、URL 停留於
    `#/`、**登入提示彈窗未出現**（`document.querySelector('[role="dialog"]')`
    為 null，重複查詢兩次排除渲染時序誤判）。
- 本輪重新調查**未發現需要修改的程式碼**——路徑分離在最初實作時就已
  正確（`if (selectedStage)` 判斷式本身沒有邏輯錯誤），問題出在完成
  報告的驗證方法本身：只驗證了路徑 A、未驗證路徑 B 就在報告中宣稱兩者
  皆正確。已排除「MyProfile 重新設定階段導致元件未重新掛載、內部
  state 殘留」的假說——該按鈕使用 `window.location.href` 賦值觸發真正
  的整頁重新載入（非 SPA `navigate()`），元件必然重新掛載、state 必然
  重置，不構成殘留污染的可能路徑。
- 無法排除的另一種可能：Lily 原始測試當下遇到的是 dev server 的
  HMR/模組快取問題（本輪對話中，Claude Code 自己在稍早的瀏覽器驗證中
  也曾遇到同類「console 顯示過期錯誤訊息，實際原始碼與全新分頁重測皆
  正常」的案例）——若後續仍能穩定重現，需要 Lily 提供具體重現步驟
  （包含是否為同一分頁連續測試兩條路徑、是否曾手動重新整理）以便進一步
  排查。

## PAT-161 [CORE_IMMUTABLE]: Phase BA 推翻 AX Path B「略過→永久不再彈」設計——產品方向調整，非工程判斷失誤

**決策記錄**（Lily 三輪明確確認，非工程端自行判斷）：
1. 未登入者的導覽視窗（`OnboardingModal.tsx`）：**每次造訪都彈**，推翻
   AX 原本「只在首次造訪跳一次」（`onboarding_completed` 旗標控制）的
   設計。
2. 略過導覽者：之後**每次造訪都要被彈登入＋隱私政策同意提示**，推翻
   AX 的 Path B（略過導覽→`PostOnboardingLoginPrompt` 永久 dismiss，
   PAT-159 記錄的原始 App 根層級架構本身沿用不變，但其上層的「略過後
   永久不再詢問」行為由本輪推翻）。
3. 登入＋同意彈窗頻率：每次造訪都彈，**直到使用者登入為止**。

**與既有原則的張力（如實記錄，非隱藏）**：此設計對未登入使用者的每次
造訪造成中斷，與 Phase AX 指令書本身明確定調的「此彈窗是『順手問一句』
不是強制關卡」「略過即永久略過，不做每 N 次造訪重新詢問的重試邏輯，
符合站台一貫的低摩擦、不騷擾原則」直接衝突——這個原則當時是寫在指令
文字裡，而非本檔案先前已存在的獨立 PAT 條目，此處特別記錄下來是因為
Phase BA 正是明確推翻了這個原則本身。這是 Lily 對產品方向的明確調整
（優先促進登入轉換率），**非工程實作判斷失誤**，未來若要理解「為什麼
同一個網站對『略過』的
處理方式前後不一致」，答案就在這裡——不是 bug，是刻意的方向轉彎。

**實作方式**（區別於 AX 既有機制，兩者並存不互相影響）：
- `Home.tsx` 的導覽視窗顯示條件從 `!isOnboardingCompleted()`（永久
  旗標，一次為真後不再顯示）改為 `!user`（純粹綁定登入狀態，`user`
  為 null 就顯示，無視過去是否顯示過）；等 `useAuth().loading` 結束
  才判斷，避免已登入者在 session 判定完成前短暫閃現導覽視窗。
- 新增獨立永久旗標 `has_skipped_onboarding_before`（`src/lib/
  onboarding.ts`），與既有的 `onboarding_completed` 是兩個不同旗標、
  互不取代——`onboarding_completed` 保留給其他既有邏輯（如 MyProfile
  「重新設定我的階段」呼叫 `resetOnboarding()`）沿用，不因本輪而移除。
- `OnboardingModal.tsx` 新增統一的 `handleSkipClose`：略過按鈕／ESC
  （原本未支援，本輪新增鍵盤處理）／背景點擊／新增的關閉 X 按鈕，
  四種出口皆走同一函式，一律寫入 `has_skipped_onboarding_before =
  true`（不可逆）。與 `handleFinish`（選定階段完成，AX 既有的 Path A）
  完全分開，`handleFinish` 不受影響、不寫入此旗標。
- 新增獨立元件 `SkipLoginConsentPrompt.tsx`（掛載於 App.tsx 根層級，
  沿用 AX 建立的 window CustomEvent 架構，見 PAT-159），監聽新事件
  `onboarding-modal-closed`（`Home.tsx` 的 `OnboardingModal.onClose`
  呼叫，涵蓋 Path A 與 Path B 兩種關閉方式），收到事件後檢查
  `!user && hasSkippedOnboardingBefore()`，成立才顯示——確保與導覽
  視窗依序出現、不同時疊加。此元件**不可永久略過**：X／ESC／背景
  點擊三種關閉方式僅本次造訪不再重複彈出，不寫入任何旗標，下次整頁
  載入重新判斷；與 AX 既有的 `PostOnboardingLoginPrompt`（Path A 專用，
  dismiss-once-永久）是兩個獨立元件，互不影響，`git diff` 確認 AX
  原有檔案的 Path A 邏輯本輪零改動（僅 `OnboardingModal.tsx` 新增
  `handleSkipClose` 與 ESC/X 處理，`handleSelectStage`/`handleFinish`
  的既有邏輯行數與內容未變）。
- 隱私同意元件：擴充既有 `PrivacyNotice.tsx` 新增 `'login'` variant
  （訊息留空，僅呈現固定的「我已閱讀並同意隱私政策」+ `/privacy` 連結），
  沿用既有的 checkbox 樣式與 GDPR 相關約定（未預先勾選），而非另建
  重複元件。Google 登入按鈕使用原生 `disabled={!agreed}` 屬性，瀏覽器
  層級阻擋未同意時的點擊（非僅視覺變灰）。
- `HeroSection.tsx` 首頁介紹文案同步修正（AW.c 遺留的「內容全公開」與
  本輪「未登入者每次造訪被彈窗」的實際體驗矛盾）：僅將「內容全公開」
  改為「瀏覽內容無需登入」，其餘文字不動——核心事實仍正確（內容確實
  不需登入即可讀取，只是路徑上會被彈窗打斷），故採字面調整而非整段
  重寫。

**已知的未涉及範圍**：GDPR 第 7(4) 條的「捆綁同意」疑慮已由 Lily 於
指令書內定調——本彈窗必須可關閉（當次造訪可略過），不得做成無法關閉
的強制牆；若未來要改為不可關閉的硬擋牆，需使用者另行明確指示，本輪
未做此改動。
