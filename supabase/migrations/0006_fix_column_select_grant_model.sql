-- 0006_fix_column_select_grant_model.sql
-- 修正0005版的做法:實測發現anon/authenticated對user_submissions本來就有
-- 「整張表」層級的SELECT權限(Supabase專案預設會這樣GRANT,RLS policy是
-- 疊加在這個基礎之上做row層級過濾,不是取代它)。在這個前提下對特定欄位
-- 下REVOKE SELECT(col)完全無效——欄位層級的revoke只會移除「欄位層級的
-- 授權項目」,不會覆蓋掉本來就存在的「整張表層級授權」,兩者是分開的
-- grant entry,查information_schema.column_privileges還是顯示SELECT
-- 允許,因為那個view回報的是「有效權限」,來源是table-level grant。
--
-- 正確做法是反過來:先撤銷整張表的SELECT,再只對「允許公開讀」的欄位
-- 明確GRANT SELECT——而不是「先全開再撤銷部分」。

REVOKE SELECT ON public.user_submissions FROM anon, authenticated;

GRANT SELECT (
  id, user_id, submission_type, target_id, title, content, status,
  created_at, target_url, target_category
) ON public.user_submissions TO anon, authenticated;

-- 明確排除(不授予SELECT)的欄位,原因見0005:
-- reviewed_at, reviewer_note(既有的內部審核欄位)
-- ai_flag, ai_flag_reason, ai_flagged_at(本次新增的AI預篩標記)
