# study-in-germany — Project Context
# 安裝位置: C:\Projects\10-101_Study_in_Germany_留學德國社群網站\CLAUDE.md

## Stack
Vite + React 18 + TypeScript + Tailwind v4 + Supabase + GitHub Pages
Deploy: `npm run build` → `gh-pages` branch → auto-deploy

## Protected Files (NEVER TOUCH without explicit written authorization)
- src/lib/supabase.ts
- src/lib/useAuth.ts
- src/lib/storage.ts
- src/lib/types.ts

## Completed Systems (do not re-implement)
- Language school review (6-dimensional rating)
- Discussion board
- 赴德指南 (life guide)
- 資源 resource library
- Visa selector (14-card, multi-step quiz)
- 5-star card rating system (15-min edit window via RLS)
- Badge / avatar / follow system
- Account soft-delete with grace period

## DB Rules
- All migrations go in supabase/migrations/
- RLS must be enabled on every new table
- Never disable RLS even temporarily
- Show migration SQL → wait for "APPROVED" → then run

## Env
- Local: .env.local (never commit)
- Supabase project: check existing supabase.ts for URL/key references
- GitHub Pages base: /study-in-germany/

## Current SDD
Read: docs/SDD.md (if exists) before starting any Phase

## 開發知識庫查證順序（2026-08-30訂定，移植自wordpress-builder-playbook
repo的同類規則）
不確定的做法先查`Meta_Dev_Knowledge.md`有沒有現成PAT條目，內部真的
沒有才查外部；查證後證實真實可用有益處的做法，直接補一則新PAT條目，
不用另外問要不要記錄。**機械複查**：`npm run check:knowledge`——PAT
編號連續性/跨檔案PAT引用完整性/過時關鍵字候選/原始碼檔案篇幅離群值，
幾秒鐘跑完。只找候選不判斷對錯，人工/AI逐一確認後才動手改。故意不進
`npm run check`硬gate，比照`check:content`/`check:links`用手動觸發
（PAT編號缺口通常是合併/重整PAT的正常結果，不像內容過期複查期限那樣
急迫，不適合自動開GitHub issue）。

**★2026-08-30訂為閥值自動觸發★收工時先跑這行判斷要不要做健檢，不用
自己記或等使用者提醒**：
```bash
git rev-list --count $(head -c 7 scripts/.last-audit-marker)..HEAD
```
（**這個檔案不存在**時上面這行會直接報錯——代表從沒跑過健檢，視同
數字已達閥值，直接跑健檢腳本並用結果建立這個檔案，不用回頭修這行
指令）**這個數字≥8就自動跑**`npm run check:knowledge`，跑完後用當下
HEAD的short SHA+日期覆寫`scripts/.last-audit-marker`。
