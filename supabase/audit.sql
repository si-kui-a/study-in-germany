-- ============================================
-- study-in-germany · audit.sql (Phase AV)
-- 目的：一次執行、輸出單一可逐行 diff 的稽核結果，用來核對線上 DB
-- 實況與 supabase/schema.sql（校正後）+ docs/expected-schema.md 是否一致。
--
-- 執行方式：Supabase Dashboard → SQL Editor → 貼上全文 → Run
-- 輸出格式：統一為 (sort_order, section, key, value) 四欄，方便整段
-- 複製後逐行對照 expected-schema.md。
--
-- 背景：2026-07-15 線上 DB 抽查發現面狀漂移（listing_likes 整表缺失、
-- profiles.persona_stage 欄位缺失、2 張 pre_v4 殭屍表存在）。schema.sql
-- 段落若從未在真實 DB 上執行驗證過，等同未經測試的程式碼——本稽核腳本
-- 目的是把「schema.sql 說了什麼」與「DB 實際是什麼」的落差一次攤開。
-- ============================================

WITH

-- 1. 全表清單
t_tables AS (
  SELECT
    1 AS sort_order,
    'TABLE' AS section,
    tablename AS key,
    '' AS value
  FROM pg_tables
  WHERE schemaname = 'public'
),

-- 2. 全欄位：table_name.column_name | data_type NOT NULL/NULL
t_columns AS (
  SELECT
    2 AS sort_order,
    'COLUMN' AS section,
    table_name || '.' || column_name AS key,
    data_type
      || CASE WHEN character_maximum_length IS NOT NULL
              THEN '(' || character_maximum_length || ')' ELSE '' END
      || CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE ' NULL' END
      || CASE WHEN column_default IS NOT NULL
              THEN ' DEFAULT ' || column_default ELSE '' END AS value
  FROM information_schema.columns
  WHERE table_schema = 'public'
),

-- 3. 全 CHECK / FK / PK / UNIQUE 約束定義
t_constraints AS (
  SELECT
    3 AS sort_order,
    'CONSTRAINT' AS section,
    conrelid::regclass::text || '.' || conname AS key,
    pg_get_constraintdef(oid) AS value
  FROM pg_constraint
  WHERE connamespace = 'public'::regnamespace
),

-- 4. 全 RLS 啟用狀態
t_rls AS (
  SELECT
    4 AS sort_order,
    'RLS' AS section,
    tablename AS key,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END AS value
  FROM pg_tables
  WHERE schemaname = 'public'
),

-- 5. 全 RLS policies：tablename.policyname | cmd / roles / qual / with_check
t_policies AS (
  SELECT
    5 AS sort_order,
    'POLICY' AS section,
    tablename || '.' || policyname AS key,
    'cmd=' || cmd
      || ' | roles=' || array_to_string(roles, ',')
      || ' | qual=' || COALESCE(qual, '(none)')
      || ' | with_check=' || COALESCE(with_check, '(none)') AS value
  FROM pg_policies
  WHERE schemaname = 'public'
),

-- 6. Storage buckets 清單
-- 若此段查詢因權限問題出錯：請刪除本區塊（t_storage 這段 WITH 子句與
-- 下方 UNION ALL 中對應的 SELECT * FROM t_storage）後重新執行本檔其餘
-- 部分，並改於 Supabase Dashboard → Storage 頁面人工核對 avatars /
-- listings 兩個 bucket 是否存在、public 狀態是否正確。
t_storage AS (
  SELECT
    6 AS sort_order,
    'STORAGE_BUCKET' AS section,
    id AS key,
    'public=' || public::text
      || ' | file_size_limit=' || COALESCE(file_size_limit::text, '(none)')
      || ' | allowed_mime_types=' || COALESCE(array_to_string(allowed_mime_types, ','), '(none)') AS value
  FROM storage.buckets
),

-- 7. 全 triggers（含 auth.users 上的 trigger，不限 public schema，
-- 因為新帳號註冊鏈 on_auth_user_created 掛在 auth.users 上）
t_triggers AS (
  SELECT
    7 AS sort_order,
    'TRIGGER' AS section,
    tgrelid::regclass::text || '.' || tgname AS key,
    pg_get_triggerdef(oid) AS value
  FROM pg_trigger
  WHERE NOT tgisinternal
),

-- 8. public schema 內的全 functions（含 handle_new_user 等）
t_functions AS (
  SELECT
    8 AS sort_order,
    'FUNCTION' AS section,
    p.proname AS key,
    pg_get_functiondef(p.oid) AS value
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
)

SELECT sort_order, section, key, value FROM t_tables
UNION ALL SELECT sort_order, section, key, value FROM t_columns
UNION ALL SELECT sort_order, section, key, value FROM t_constraints
UNION ALL SELECT sort_order, section, key, value FROM t_rls
UNION ALL SELECT sort_order, section, key, value FROM t_policies
UNION ALL SELECT sort_order, section, key, value FROM t_storage
UNION ALL SELECT sort_order, section, key, value FROM t_triggers
UNION ALL SELECT sort_order, section, key, value FROM t_functions
ORDER BY sort_order, key;
