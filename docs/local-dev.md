# 本地開發指南

## 首次啟動

```powershell
cd C:\Projects\study-in-germany
npm install
Copy-Item .env.example .env.local
# 編輯 .env.local 填入 SUPABASE URL / anon key
npm run dev
```

瀏覽器打開 `http://localhost:5173/`（本專案 base 為 './'，dev server 無子路徑）。

## Mock Mode（DB 未就緒或 OAuth 待修時）

```powershell
Add-Content -Path .env.local -Value "VITE_MOCK_MODE=1"
npm run dev
```

頁面頂端會出現金色 Mock Banner。
關閉：從 .env.local 移除該行即可。

## DevBadge
左下角有 `dev` 折疊按鈕，展開顯示 build 版本、mock 狀態、主題、網路。
僅 dev build 顯示，production build 自動移除。

## 建置驗證

```powershell
npm run typecheck   # tsc -b（noEmit 已於 tsconfig 設定）
npm run build       # tsc -b + vite build
npm run test        # 核心規則單元測試
npm run check       # 提交前的完整品質檢查
npm run preview     # 檢視 dist/
```

## 分支結構

`main` 為已部署 GH Pages 的穩定線（現行 v0.7.0）。每個 Phase 從 `main` 開新分支
（`phase-<name>`），typecheck + build 綠燈、瀏覽器驗證過，push 後由需求方（Lily）
目視驗收才 `git merge --ff-only` 進 main，**不自動合併**。

```
main ← phase-<name>（單分支 ff）
```

若 Phase 之間有依賴（如 B.1/B.2 需先整合），視情況建立中繼整合分支再 ff 進 main，
細節見對應 Phase 的完成報告與 `work/activity.log`（gitignored，本機開發歷程紀錄）。

## 疑難排解

### `Invalid API key`
`.env.local` 未填、或填錯 SUPABASE URL / ANON KEY。

### `row violates row-level security policy`
未登入時嘗試寫入。或 RLS policy 條件不符。

### `column stars_teaching does not exist` / `column "stars" does not exist`
舊版 v2 DB 尚未完成一次性基準遷移。只有舊專案需先執行 `supabase/migrate_v2_to_v4.sql`；此後所有正式變更一律依序套用 `supabase/migrations/`，不要重複執行整份 `schema.sql`。

## 資料庫檔案責任

- `supabase/migrations/`：正式資料庫變更的唯一來源，依檔名順序執行。
- `supabase/schema.sql`：新環境的基準快照，不作為日常增量更新指令。
- `supabase/audit.sql`：唯讀核對，不修改正式資料。
- `docs/expected-schema.md`：audit 結果的人類可讀參考。

`0008_community_rate_limit.sql` 必須先在測試／預備環境驗證，再套用正式環境；它會為匿名投稿與檢舉增加伺服器端頻率及重複內容限制。

### OAuth `Unable to exchange external code`
Supabase 端的 Google Client Secret 不正確或已失效。修法：Google Cloud Console
該 OAuth 用戶端「新增密鑰」取得 GOCSPX-* → 貼回 Supabase Authentication →
Providers → Google → Save。另確認 Supabase URL Configuration 的 Redirect URLs
含正式站與 localhost:5173。
