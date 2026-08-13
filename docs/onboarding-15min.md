# 15 分鐘上手：留德華站

## 前 3 分鐘：這是什麼

留德華站 v0.7.0：Vite + React 19 + TypeScript + Tailwind v4 + Supabase 的 SPA，
部署於 GitHub Pages（HashRouter，無伺服器 rewrite）。核心功能：

1. 語校評價（讀公開、寫需登入，6 維評分自動計算 overall）
2. 生活佈告欄（4 類：出租 / 求租 / 二手 / 討論區，可附照片）
3. 作戰手冊 Edu（7 主題、53 個 step 的簽證/落地/延簽/學程/獎學金/政策/離境 workflow）
4. 常見問答（靜態 5 題）
5. 全站搜尋（Cmd/Ctrl+K）

架構鐵律：**DB RLS 才是真權限層，前端 AuthGate 只是 UX**。

## 3–5 分鐘：分支與版本

各 Phase 以獨立分支開發（`phase-<name>`），typecheck + build 綠燈、瀏覽器驗證過，
push 後由需求方（Lily）目視驗收才 `git merge --ff-only` 進 main，不自動合併。
目前累計 50 條 PAT（架構決策）於 `Meta_Dev_Knowledge.md`，git tag 由 v0.2.0 到 v0.7.0。

## 5–8 分鐘：本地跑起來

```powershell
cd C:\Projects\study-in-germany
npm install
Copy-Item .env.example .env.local
# 編輯 .env.local 填入 SUPABASE_URL / anon key

# 若 DB / OAuth 未就緒，用 mock mode：
Add-Content -Path .env.local -Value "VITE_MOCK_MODE=1"

npm run dev
# http://localhost:5173/（base './'，dev server 無子路徑）
```

左下角 `dev` 按鈕展開看：mock 狀態、主題、網路、build 版本。

## 8–12 分鐘：關鍵檔案

**永遠不動**（動了要重跑整輪 governance）：
- `src/lib/supabase.ts` — client 單例，PKCE + detectSessionInUrl
- `src/lib/useAuth.ts` — Google OAuth hook，redirectTo 修正
- `src/lib/storage.ts` — 照片壓縮 + upload + delete
- `src/lib/types.ts` — 契約層（Listing / SchoolReview / RatingSchema / ListingType）
- `supabase/*.sql` — schema + RLS

**lib/ 業務邏輯**：
- `src/lib/ratings.ts` — 6 維評分：`RATING_DIMENSIONS` 常量 + `calculateOverall()`
- `src/lib/board.ts` — 佈告欄 4 類：`BoardType`、`BOARD_TYPE_LABEL`、discussion 的 UI 端 title 前綴 fake（PAT-48）
- `src/lib/search.ts` — 全站搜尋（純 client substring，零依賴）
- `src/lib/errorMessages.ts` — PostgREST 錯誤代碼 → 中文訊息
- `src/lib/theme.tsx` — `ThemeProvider` + `useTheme`（system 偏好 + localStorage）
- `src/lib/toast.tsx` — Toast Context
- `src/lib/mockMode.ts` / `mockData.ts` — Mock Mode 開關與假資料
- `src/lib/useHotSchools.ts` — 熱門語校排序 hook
- `src/lib/markdown.ts` — ⚠️ Phase B.3 遺留，Phase C.1 後已無業務使用（PAT-31 DEPRECATE_MARK），勿以為是現行 Edu 內容管道

**產品邏輯集中**：
- `src/pages/Board.tsx` — 佈告欄，4 類 filter（含 discussion）+ 4 種檢視模式
  （全部貼文／追蹤動態／我的貼文／我的評價，Phase AE/AJ 起原 MyPosts.tsx 併入於此）
- `src/pages/Edu.tsx` / `EduTopic.tsx` — Edu Hub + workflow 詳情頁
- `src/components/SchoolDetail.tsx` — 語校詳情 + 評價 + 6 維 breakdown + 住宿
- `src/components/ReviewForm.tsx` / `StarSlider.tsx` — 6 維評分表單（整星，Phase V 起不再半星）
- `src/components/RatingBreakdown.tsx` — 評分 breakdown（compact 一行 / bar-chart 全維雙 mode）
- `src/components/BoardForm.tsx` / `BoardList.tsx` — 4 類發文表單與列表
- `src/components/edu/` — `WorkflowCard.tsx` / `WorkflowTimeline.tsx` / `PriorityBadge.tsx`
- `src/components/PhotoUploader.tsx` / `PhotoGallery.tsx` — 6 張上限、client canvas 壓縮
- `src/components/SearchModal.tsx` — Cmd/Ctrl+K 全站搜尋

**設計 token 集中**：
- `src/index.css` — CSS vars（light + dark）+ component tokens + print stylesheet；Tailwind v4 `@theme inline`

**資料契約**：
- `src/data/edu/workflow.ts` — `WorkflowTopic` / `WorkflowStep` / `ProcedureItem` 型別（見 PAT-29、PAT-36）
- `src/data/edu/{visa,arrival,renewal,application,scholarship,policy,exit}.ts` — 7 主題資料檔，各匯出一個 `WorkflowTopic` 常數
- `src/data/schools.json` — 語校資料，含 `accommodation: string | null`（PAT-50）
- `src/data/faq.json` / `announcements.json` — 靜態資料

## 12–15 分鐘：常見任務對應檔

| 想做 | 動哪 |
|---|---|
| 加語校 | `src/data/schools.json` 加一筆（含 `accommodation`）+ 可能加 `src/assets/cities/<新城>.tsx` 並註冊於 `cities/index.tsx` |
| 改主色 | `src/index.css` 的 `--brand-burgundy` / `--brand-gold` |
| 加評分維度 | `src/lib/ratings.ts` 的 `RATING_DIMENSIONS` 加一筆；`ReviewForm.tsx` 會自動渲染對應 `StarSlider` |
| 加佈告欄「真」類型（schema 變更） | ⚠️ 動 `supabase/schema.sql` 的 `listings.type` CHECK + `types.ts` 的 `ListingType`；需求方確認後才能執行 |
| 加 Edu workflow step | 對應主題檔（`src/data/edu/*.ts`）加一個 `WorkflowStep` object，遵守 `workflow.ts` interface |
| 加公告 | `src/data/announcements.json` prepend |
| 加 FAQ | `src/data/faq.json`（注意：`FAQ.tsx` 是元件、`Faq.tsx` 是頁面，兩者皆存在） |
| 加錯誤翻譯 | `src/lib/errorMessages.ts` 的 `CODE_MAP` 或 `MESSAGE_PATTERNS` |
| 加一個新 PAT | `Meta_Dev_Knowledge.md` 加 `## PAT-XX [LEVEL]:` 段落 + `docs/pat-index.md` 索引表加一行 |
| 新增/改寫任何使用者看得到的文案 | 先查 `docs/content-style-guide.md`（口吻/結構/用詞/翻譯慣例整理版），權威版本在 `Meta_Dev_Knowledge.md` PAT-16/37/38/39/40/152/162/165/183 |

## 出問題找誰
- Build 錯誤 → 先看 typecheck 訊息，本專案 `verbatimModuleSyntax: true`，type-only import 需 `import type`
- 設計 / 架構決策 → PAT 索引 `docs/pat-index.md` → 詳細於 `Meta_Dev_Knowledge.md`
- 文案口吻/用詞怎麼寫 → `docs/content-style-guide.md`
- DB 遷移 → `supabase/schema.sql`（現行 v4 schema，`migrate_v2_to_v4.sql` 僅供舊 v2 DB 一次性遷移）
- OAuth / 環境設定疑難排解 → `docs/local-dev.md`
