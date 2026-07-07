# PROGRESS

## 2026-07-07 — v2 初始建置（Google OAuth + RLS）

### 建置內容
- Scaffold：`npm create vite@latest -- --template react-ts`（Vite 8.1.3、React 19.2.7、TypeScript 6.0.2）
- 依賴：@supabase/supabase-js 2.110.0、react-router-dom 7.18.1、tailwindcss 4.3.2（@tailwindcss/vite plugin）
- tsconfig.app.json：加入 `strict: true`、`resolveJsonModule: true`
- vite.config.ts：`base: './'` + tailwindcss plugin

### 產出檔案
| 檔案 | 說明 |
|------|------|
| src/lib/supabase.ts | createClient，detectSessionInUrl: true、flowType: 'pkce'；env 缺失時擲明確錯誤 |
| src/lib/useAuth.ts | 依使用者提供範例；增加 redirectTo（GH Pages 子路徑需要） |
| src/lib/types.ts | DB row 型別 + attachProfiles()（client-side join，因 schema 無 reviews→profiles FK） |
| src/components/Header.tsx | 登入狀態顯示（頭像+名稱）、Google 登入/登出、我的發文連結 |
| src/components/AuthGate.tsx | 未登入顯示登入提示；註明 RLS 才是真正權限層 |
| src/components/PrivacyNotice.tsx | 可重用同意勾選（required checkbox + /privacy 連結） |
| src/components/ReviewForm.tsx | 星等×2 + 評論；勾選同意才可送出；insert 帶 user.id |
| src/components/ReviewList.tsx | 公開讀取；作者資料自 profiles 合併；本人顯示刪除鈕 |
| src/components/BoardForm.tsx | 類型/地區/標題/內容/價格/聯絡方式；同意公開聯絡方式 checkbox |
| src/components/BoardList.tsx | 類型篩選 tabs；過期過濾交由 RLS |
| src/components/SchoolList/Detail、FAQ、Footer | v1 靜態內容元件 |
| src/pages/Home、Schools、Board、Privacy、MyPosts | 5 路由頁面 |
| src/data/schools.json（5 校）、faq.json（6 題） | 靜態資料 |
| supabase/schema.sql | 使用者提供之 SQL 原樣保存（僅加註執行說明） |
| .github/workflows/deploy.yml | GH Pages 官方 artifact 流程；SUPABASE_URL/ANON_KEY Secrets → VITE_ env |
| .env.example / .env.local | env 範本 / 本地佔位值（.local 已 gitignore） |

### 驗證結果
- `npm run build`（tsc -b && vite build）：✅ 通過，0 error。bundle 466.29 kB（gzip 134.33 kB）
- Dev server smoke test（佔位 Supabase env）：
  - `#/` 首頁 ✅、`#/schools/goethe-berlin` ✅（AuthGate 正確顯示登入提示）
  - `#/board` ✅、`#/my-posts` ✅（未登入擋下）、`#/privacy` ✅
  - Console：0 error

## 2026-07-07 — GitHub repo 建立與首次部署

- `git init -b main`，初始 commit `a6e4edc`（39 檔案；`.env.local` 經確認未入庫，並移除殘留 template 資源 src/assets、public/icons.svg）
- 以 Git Credential Manager 既存憑證（scopes: gist, repo, workflow）呼叫 GitHub API：
  - 建立 public repo `lilichen-F/study-in-germany`（201）。第一次呼叫因 inline JSON 中文 payload 編碼問題靜默失敗（404 驗證），改 ASCII 描述 + `--data @file` 成功
  - 啟用 GitHub Pages `build_type: workflow`（201）
- `git push -u origin main` ✅
- Workflow run #1：build ✅ / deploy ❌（當時 Pages 尚未啟用）→ 啟用後 workflow_dispatch 重跑：**全綠 ✅**
- 上線驗證：https://lilichen-f.github.io/study-in-germany/ 回 HTTP 200，title 正確
- ⚠️ **repo Secrets（SUPABASE_URL / SUPABASE_ANON_KEY）尚未設定**：build 不會失敗，但目前線上頁面在 supabase.ts 擲出 env 缺失錯誤（設計如此）。使用者設定 Secrets 後需再跑一次 workflow
- 注意：SSH host alias `github.com-deutsch-weg` 綁的是另一個專案 `lilichen-F/deutsch-weg`（德語學習站），與本專案無關，未使用

## 2026-07-07 — Secrets 設定與正式上線驗證

- gh CLI 2.96.0 安裝完成，使用者以瀏覽器流程完成 `gh auth login`（scopes: gist, read:org, repo, workflow）
- 使用者提供新版 API keys：`sb_publishable_...`（前端用）與 `sb_secret_...`（**未使用**，已提醒 server-only + 建議 rotate，因曾貼於對話）
- `gh secret set`：SUPABASE_URL = https://httksnqnxaeacmockphr.supabase.co、SUPABASE_ANON_KEY = sb_publishable_...（06:48 UTC）
- `.env.local` 更新為真實值（gitignore 排除，未入庫）
- **Supabase 端驗證**（curl REST API）：
  - school_reviews / listings / profiles 三表皆存在且公開可讀（HTTP 200）→ 使用者已執行 schema.sql
  - 匿名 INSERT school_reviews → HTTP 401, code 42501 "violates row-level security policy" ✅ RLS 生效
- workflow run 28847315180：build ✅ deploy ✅
- 線上 bundle（assets/index-C685tH5_.js）確認含注入的 Supabase URL
- 本地 dev server 實測：評價/佈告欄顯示正常空狀態（非錯誤），console 0 error，Supabase 讀取路徑全通
- ⚠️ 尚待使用者手動：Supabase Authentication → Google provider 啟用 + URL Configuration（Site URL / Redirect URLs）；完成前線上「使用 Google 登入」會失敗

## 2026-07-07 — Google OAuth redirect_uri_mismatch 除錯

- 使用者實測登入 → Google 回 400 redirect_uri_mismatch（錯誤詳情顯示送出的 redirect_uri 為正確的 Supabase callback）
- Supabase 端驗證全過：settings 顯示 google:true、/authorize 302 至 accounts.google.com（client_id 785350789128-dvctg...）
- 經瀏覽器直查 Google Cloud Console（專案 study-in-germany-501702）：
  - 僅一個 OAuth 用戶端，即 Supabase 使用中的那個 → 排除改錯用戶端
  - 「已授權的重新導向 URI」欄位內容逐字正確
  - **根因：該筆 URI 未按「儲存」**，一直停留在編輯狀態
- 按下儲存 → Console 確認「OAuth 用戶端已儲存」（生效需 5 分鐘～數小時，通常數分鐘）
- 教訓：curl 測 /authorize 302 to Google 無錯誤 ≠ redirect_uri 已註冊——未登入請求會先被導去登入頁，URI 驗證發生在使用者登入後，外部探測會出現假陰性

### 已知注意事項
- listings 的 `listings_public_read` policy（expires_at > NOW()）對所有 SELECT 生效
  → **本人在 /my-posts 也看不到自己已過期的貼文**（依提供之 SQL 原樣實作，未擅改）
- 尚未 git init / commit（等使用者指示）
- Supabase 端需手動：執行 schema.sql、啟用 Google provider、設定 Redirect URLs（見 README）
