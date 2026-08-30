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

**全面收斂稽核（多輪修改收工前，或使用者要求「嚴格審核」時執行，
2026-08-30訂定，移植自wordpress-builder-playbook repo Phase 4.5的
同類概念，通用程式碼repo版）**：跟上面的機械複查是不同顆粒度、不同
觸發時機的兩件事——機械複查抓的是「距離上次健檢累積了幾個commit」
這種跨時間的知識庫落後；這裡抓的是「同一個功能/檔案範圍累積了多輪
反覆修改」造成的跨輪次內部不一致，零星單點驗證會漏掉這種「這一輪改
完當下沒問題，但跟三輪前改的地方兜不起來」的落差。

觸發時機：①同一功能/同一批檔案累積修改超過~10輪以上準備收工前，
②使用者明確要求「嚴格審核」/「全面檢查」時，③或懷疑有跨輪次殘留
不一致但說不出具體是什麼時。

查什麼：(1)跨檔案命名/欄位一致性——同一概念在本輪異動涉及的不同
檔案有沒有被叫成不同名字；(2)死碼/孤兒函式——早期輪次寫的邏輯被
同一輪內更晚版本取代但沒刪掉；(3)文件/註解與目前程式碼行為脫節；
(4)重複邏輯可收斂成共用函式卻沒有抽。跑完直接修掉抓到的問題，不用
等使用者再次提出——這是「收斂」動作的一部分，不是額外加碼。
