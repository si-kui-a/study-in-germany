# study-in-germany — Project Context
# 安裝位置: C:\Projects\study-in-germany\CLAUDE.md

## Stack
Vite + React 18 + TypeScript + Tailwind v4 + Supabase + GitHub Pages
Deploy: `npm run build` → `gh-pages` branch → auto-deploy

## Protected Files (NEVER TOUCH without explicit written authorization)
- src/lib/supabase.ts
- src/hooks/useAuth.ts
- src/lib/storage.ts
- src/types/index.ts

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
