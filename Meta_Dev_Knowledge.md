# Meta_Dev_Knowledge — study-in-germany

> PAT-01..05 於 Phase A.5 依實際專案歷史補齊（原標 N/A-external，2026-07-08 修正）。

## PAT-01 [CORE_IMMUTABLE]: HashRouter + PKCE OAuth callback 相容性
根因：GH Pages `/study-in-germany/` 子路徑，PKCE `?code=` 於 query，
HashRouter `#/` 於 fragment，兩者不衝突但 `redirectTo` 必須顯式指定
`window.location.origin + window.location.pathname`。

## PAT-02 [CORE_IMMUTABLE]: PostgREST 無法 auto-embed auth.users FK
根因：school_reviews.user_id / listings.user_id 外鍵指向 auth.users 而非
public.profiles。前端以 attachProfiles() 於 types.ts 批次補齊。

## PAT-03 [DEPRECATE_MARK]: listings_public_read policy 對本人也生效
`expires_at > NOW()` 條件使本人於 /my-posts 也看不到過期貼文。
若需放寬：USING (expires_at > NOW() OR auth.uid() = user_id)。

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
